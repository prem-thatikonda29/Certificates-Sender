import csv
import json
import os
import tempfile
from unittest.mock import MagicMock, patch

import pytest

from run import (
    load_cursor,
    load_sent,
    log_result,
    make_smtp,
    save_cursor,
    send_email,
)


# ── Cursor (progress.json) ────────────────────────────────────

class TestCursor:
    def test_load_cursor_missing_file(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        assert load_cursor("winner") == 0

    def test_load_cursor_existing(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "progress.json").write_text(json.dumps({"winner": 3}))
        assert load_cursor("winner") == 3

    def test_load_cursor_missing_tier(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "progress.json").write_text(json.dumps({"runner_up": 5}))
        assert load_cursor("winner") == 0

    def test_save_cursor_creates_file(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        save_cursor("winner", 10)
        data = json.loads((tmp_path / "progress.json").read_text())
        assert data["winner"] == 10

    def test_save_cursor_preserves_other_tiers(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "progress.json").write_text(json.dumps({"runner_up": 5}))
        save_cursor("winner", 3)
        data = json.loads((tmp_path / "progress.json").read_text())
        assert data["winner"] == 3
        assert data["runner_up"] == 5

    def test_save_cursor_overwrites(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        save_cursor("winner", 1)
        save_cursor("winner", 99)
        data = json.loads((tmp_path / "progress.json").read_text())
        assert data["winner"] == 99


# ── Sent log ───────────────────────────────────────────────────

class TestSentLog:
    def _write_log(self, path, rows):
        with open(path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["tier", "name", "email", "sent_at", "status"])
            for row in rows:
                writer.writerow(row)

    def test_load_sent_missing_file(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        assert load_sent() == set()

    def test_load_sent_returns_sent_emails(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        self._write_log(tmp_path / "sent_log.csv", [
            ["winner", "Alice", "a@test.com", "2026-01-01T00:00:00", "sent"],
            ["winner", "Bob", "b@test.com", "2026-01-01T00:00:01", "failed"],
        ])
        sent = load_sent()
        assert "a@test.com" in sent
        assert "b@test.com" not in sent

    def test_load_sent_excludes_failed(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        self._write_log(tmp_path / "sent_log.csv", [
            ["winner", "Alice", "a@test.com", "2026-01-01T00:00:00", "failed"],
        ])
        assert load_sent() == set()

    def test_log_result_creates_file(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        log_result("winner", "Alice", "a@test.com", "sent")
        assert (tmp_path / "sent_log.csv").exists()

    def test_log_result_appends(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        log_result("winner", "Alice", "a@test.com", "sent")
        log_result("winner", "Bob", "b@test.com", "failed")
        with open(tmp_path / "sent_log.csv") as f:
            rows = list(csv.DictReader(f))
        assert len(rows) == 2
        assert rows[0]["name"] == "Alice"
        assert rows[1]["name"] == "Bob"

    def test_log_result_has_header(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        log_result("winner", "Alice", "a@test.com", "sent")
        with open(tmp_path / "sent_log.csv") as f:
            first_line = f.readline().strip()
        assert first_line == "tier,name,email,sent_at,status"

    def test_log_result_no_duplicate_header(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        log_result("winner", "Alice", "a@test.com", "sent")
        log_result("winner", "Bob", "b@test.com", "sent")
        with open(tmp_path / "sent_log.csv") as f:
            lines = f.readlines()
        header_count = sum(1 for l in lines if l.startswith("tier,"))
        assert header_count == 1


# ── send_email ─────────────────────────────────────────────────

class TestSendEmail:
    @pytest.fixture
    def smtp_mock(self):
        return MagicMock()

    @pytest.fixture
    def tier(self):
        return {
            "email_subject": "Your certificate",
            "email_body": "Hi {name},\n\nCongrats!",
        }

    def test_sends_to_correct_address(self, smtp_mock, tier, tmp_path):
        pdf = tmp_path / "cert.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")
        send_email(smtp_mock, "Alice", "alice@test.com", str(pdf), tier)
        smtp_mock.sendmail.assert_called_once()
        args = smtp_mock.sendmail.call_args
        assert "alice@test.com" in args[0][2]  # msg_as_string is 3rd arg

    def test_includes_cc(self, smtp_mock, tier, tmp_path):
        pdf = tmp_path / "cert.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")
        send_email(smtp_mock, "Alice", "alice@test.com", str(pdf), tier)
        call_args = smtp_mock.sendmail.call_args
        msg_string = call_args[0][2]
        assert "Cc:" in msg_string

    def test_subject_matches_tier(self, smtp_mock, tier, tmp_path):
        pdf = tmp_path / "cert.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")
        send_email(smtp_mock, "Alice", "alice@test.com", str(pdf), tier)
        msg_string = smtp_mock.sendmail.call_args[0][2]
        assert "Your certificate" in msg_string

    def test_body_contains_name(self, smtp_mock, tier, tmp_path):
        pdf = tmp_path / "cert.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")
        send_email(smtp_mock, "Alice", "alice@test.com", str(pdf), tier)
        msg_string = smtp_mock.sendmail.call_args[0][2]
        assert "Hi Alice" in msg_string

    def test_missing_pdf_raises(self, smtp_mock, tier):
        with pytest.raises(FileNotFoundError):
            send_email(smtp_mock, "Alice", "alice@test.com", "/nonexistent.pdf", tier)


# ── make_smtp ──────────────────────────────────────────────────

class TestMakeSmtp:
    @patch("run.smtplib.SMTP")
    def test_connects_to_configured_host(self, mock_smtp):
        mock_instance = MagicMock()
        mock_smtp.return_value = mock_instance
        make_smtp()
        mock_smtp.assert_called_once()
        call_args = mock_smtp.call_args
        assert call_args[0][0] == "smtp.gmail.com"
        assert call_args[0][1] == 587

    @patch("run.smtplib.SMTP")
    @patch("run.GMAIL_USER", "test@gmail.com")
    @patch("run.GMAIL_APP_PASSWORD", "test-pass")
    def test_logins_with_env_creds(self, mock_smtp):
        mock_instance = MagicMock()
        mock_smtp.return_value = mock_instance
        make_smtp()
        mock_instance.login.assert_called_once_with("test@gmail.com", "test-pass")
