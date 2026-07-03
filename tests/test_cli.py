import sys
from unittest.mock import MagicMock, patch

import pytest

from config import TIERS


class TestCLIParsing:
    def test_no_args_runs_all_tiers(self):
        with patch("sys.argv", ["run.py"]):
            from run import main
            # Should not raise
            with patch("run.make_smtp") as mock_smtp:
                mock_smtp.return_value = MagicMock()
                with patch("run.run_tier") as mock_tier:
                    main()
                    assert mock_tier.call_count == len(TIERS)

    def test_single_tier_arg(self):
        with patch("sys.argv", ["run.py", "winner"]):
            from run import main
            with patch("run.make_smtp") as mock_smtp:
                mock_smtp.return_value = MagicMock()
                with patch("run.run_tier") as mock_tier:
                    main()
                    assert mock_tier.call_count == 1
                    args = mock_tier.call_args
                    assert args[0][0] == "winner"

    def test_invalid_tier_exits(self):
        with patch("sys.argv", ["run.py", "nonexistent"]):
            from run import main
            with pytest.raises(SystemExit, match="Unknown tier"):
                main()

    def test_dry_run_flag(self):
        with patch("sys.argv", ["run.py", "--dry-run"]):
            from run import main
            with patch("run.make_smtp") as mock_smtp:
                with patch("run.run_tier") as mock_tier:
                    main()
                    # SMTP should not be created in dry-run
                    mock_smtp.assert_not_called()

    def test_batch_flag(self):
        with patch("sys.argv", ["run.py", "--batch=5"]):
            from run import main
            with patch("run.make_smtp") as mock_smtp:
                mock_smtp.return_value = MagicMock()
                with patch("run.run_tier") as mock_tier:
                    main()
                    for call in mock_tier.call_args_list:
                        assert call[0][4] == 5  # 5th positional arg is batch

    def test_batch_with_tier(self):
        with patch("sys.argv", ["run.py", "winner", "--batch=10"]):
            from run import main
            with patch("run.make_smtp") as mock_smtp:
                mock_smtp.return_value = MagicMock()
                with patch("run.run_tier") as mock_tier:
                    main()
                    assert mock_tier.call_count == 1
                    assert mock_tier.call_args[0][4] == 10

    @patch("run.GMAIL_USER", None)
    @patch("run.GMAIL_APP_PASSWORD", None)
    def test_missing_env_vars_exits(self):
        with patch("sys.argv", ["run.py"]):
            from run import main
            with pytest.raises(SystemExit, match="GMAIL_USER"):
                main()

    def test_dry_run_skips_env_check(self, monkeypatch):
        monkeypatch.delenv("GMAIL_USER", raising=False)
        monkeypatch.delenv("GMAIL_APP_PASSWORD", raising=False)
        with patch("sys.argv", ["run.py", "--dry-run"]):
            from run import main
            with patch("run.run_tier"):
                # Should not raise
                main()
