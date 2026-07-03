import os
import re
import tempfile

import pytest
from PIL import Image, ImageDraw

from config import FONT_PATH, TIERS
from generate_certs import fit_font, generate_certificate, sanitize_name


# ── sanitize_name ──────────────────────────────────────────────

class TestSanitizeName:
    def test_simple_name(self):
        assert sanitize_name("Priya Sharma") == "priya_sharma"

    def test_lowercase(self):
        assert sanitize_name("RAHUL VERMA") == "rahul_verma"

    def test_strips_special_chars(self):
        assert sanitize_name("O'Connor-Smith") == "oconnorsmith"

    def test_strips_parentheses(self):
        assert sanitize_name("Kishan Ojha (Btech Cse)") == "kishan_ojha_btech_cse"

    def test_strips_dots(self):
        assert sanitize_name("J. K. Rowling") == "j_k_rowling"

    def test_strips_at_sign(self):
        assert sanitize_name("user@name") == "username"

    def test_extra_spaces(self):
        assert sanitize_name("  too   many   spaces  ") == "too___many___spaces"

    def test_empty_string(self):
        assert sanitize_name("") == ""

    def test_only_special_chars(self):
        assert sanitize_name("@#$%") == ""

    def test_unicode_name(self):
        result = sanitize_name("José García")
        assert "jos" in result.lower()


# ── fit_font ───────────────────────────────────────────────────

class TestFitFont:
    def test_short_name_fits_at_max_size(self):
        font = fit_font("Ali", 66, 1740)
        assert font.size == 66

    def test_long_name_shrinks(self):
        font = fit_font("Bartholomew Jojo Simpson the Third Jr.", 66, 1740)
        assert font.size < 66

    def test_very_long_name_shrinks_a_lot(self):
        font = fit_font("A" * 80, 66, 1740)
        assert font.size <= 20

    def test_min_font_size(self):
        font = fit_font("A" * 200, 66, 1740)
        assert font.size >= 10

    def test_returns_freetype_font(self):
        font = fit_font("Test", 66, 1740)
        from PIL.ImageFont import FreeTypeFont
        assert isinstance(font, FreeTypeFont)


# ── generate_certificate ──────────────────────────────────────

class TestGenerateCertificate:
    @pytest.fixture
    def tier(self):
        return {
            "csv": "data/winner.csv",
            "template": "templates/winner_template.jpg",
            "output_dir": "output/winner",
            "cert_suffix": "test_cert",
            "text_position": (1263, 675),
            "font_size": 66,
            "max_text_width": 1740,
        }

    def test_generates_pdf(self, tier, tmp_path):
        out = str(tmp_path / "test.pdf")
        generate_certificate("Test User", out, tier)
        assert os.path.exists(out)
        assert os.path.getsize(out) > 0

    def test_pdf_starts_with_pdf_header(self, tier, tmp_path):
        out = str(tmp_path / "test.pdf")
        generate_certificate("Test User", out, tier)
        with open(out, "rb") as f:
            assert f.read(5) == b"%PDF-"

    def test_long_name_generates_pdf(self, tier, tmp_path):
        out = str(tmp_path / "long.pdf")
        generate_certificate("Bartholomew Jojo Simpson the Third", out, tier)
        assert os.path.exists(out)
        assert os.path.getsize(out) > 0

    def test_short_name_generates_pdf(self, tier, tmp_path):
        out = str(tmp_path / "short.pdf")
        generate_certificate("Ali", out, tier)
        assert os.path.exists(out)

    def test_no_tmp_png_left_behind(self, tier, tmp_path):
        out = str(tmp_path / "clean.pdf")
        generate_certificate("Test User", out, tier)
        tmp_png = out.replace(".pdf", "_tmp.png")
        assert not os.path.exists(tmp_png)

    def test_missing_template_raises(self, tier, tmp_path):
        tier = {**tier, "template": "nonexistent.jpg"}
        out = str(tmp_path / "fail.pdf")
        with pytest.raises(Exception):
            generate_certificate("Test User", out, tier)
