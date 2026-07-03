import csv
import os
from unittest.mock import MagicMock, patch

import pytest

from send_certs import load_sent, log_result, run_tier, send_email


class TestSendCertsRunTier:
    @pytest.fixture
    def smtp_mock(self):
        return MagicMock()

    def _make_csv(self, path, rows):
        with open(path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["name", "email"])
            writer.writeheader()
            for row in rows:
                writer.writerow(row)

    def test_skips_missing_name(self, smtp_mock, tmp_path):
        csv_path = str(tmp_path / "test.csv")
        self._make_csv(csv_path, [{"name": "", "email": "a@test.com"}])
        output_dir = str(tmp_path / "output")
        tier = {
            "csv": csv_path,
            "output_dir": output_dir,
            "cert_suffix": "test",
            "email_subject": "Subj",
            "email_body": "Hi {name}",
        }
        ok, skip, fail = run_tier(smtp_mock, "test", tier, set())
        assert ok == 0
        assert skip == 1
        assert fail == 0

    def test_skips_missing_email(self, smtp_mock, tmp_path):
        csv_path = str(tmp_path / "test.csv")
        self._make_csv(csv_path, [{"name": "Alice", "email": ""}])
        output_dir = str(tmp_path / "output")
        tier = {
            "csv": csv_path,
            "output_dir": output_dir,
            "cert_suffix": "test",
            "email_subject": "Subj",
            "email_body": "Hi {name}",
        }
        ok, skip, fail = run_tier(smtp_mock, "test", tier, set())
        assert ok == 0
        assert skip == 1

    def test_skips_already_sent(self, smtp_mock, tmp_path):
        csv_path = str(tmp_path / "test.csv")
        self._make_csv(csv_path, [{"name": "Alice", "email": "a@test.com"}])
        output_dir = str(tmp_path / "output")
        tier = {
            "csv": csv_path,
            "output_dir": output_dir,
            "cert_suffix": "test",
            "email_subject": "Subj",
            "email_body": "Hi {name}",
        }
        ok, skip, fail = run_tier(smtp_mock, "test", tier, {"a@test.com"})
        assert ok == 0
        assert skip == 1  # counted as skipped

    def test_skips_missing_pdf(self, smtp_mock, tmp_path):
        csv_path = str(tmp_path / "test.csv")
        self._make_csv(csv_path, [{"name": "Alice", "email": "a@test.com"}])
        output_dir = str(tmp_path / "output")
        os.makedirs(output_dir, exist_ok=True)
        tier = {
            "csv": csv_path,
            "output_dir": output_dir,
            "cert_suffix": "test",
            "email_subject": "Subj",
            "email_body": "Hi {name}",
        }
        ok, skip, fail = run_tier(smtp_mock, "test", tier, set())
        # PDF was never generated, so it should skip
        assert ok == 0
        assert skip == 1


class TestSendCertsSendEmail:
    def test_composes_correct_message(self, tmp_path):
        smtp = MagicMock()
        pdf = tmp_path / "cert.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")
        tier = {"email_subject": "Test Subject", "email_body": "Hello {name}"}
        send_email(smtp, "Alice", "alice@test.com", str(pdf), tier)
        smtp.sendmail.assert_called_once()
        msg = smtp.sendmail.call_args[0][2]
        assert "Test Subject" in msg
        assert "Hello Alice" in msg
