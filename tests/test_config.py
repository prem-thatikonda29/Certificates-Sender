import os
import sys

import pytest

from config import CC_ADDRESSES, FONT_COLOR, FONT_PATH, PILL_COLOR, SMTP_HOST, SMTP_PORT, TIERS


class TestConfig:
    def test_tiers_not_empty(self):
        assert len(TIERS) > 0

    def test_each_tier_has_required_keys(self):
        required = {"csv", "template", "output_dir", "cert_suffix", "text_position", "font_size", "max_text_width", "email_subject", "email_body"}
        for name, tier in TIERS.items():
            missing = required - set(tier.keys())
            assert not missing, f"Tier '{name}' missing keys: {missing}"

    def test_text_position_is_tuple_of_two_ints(self):
        for name, tier in TIERS.items():
            pos = tier["text_position"]
            assert isinstance(pos, tuple) and len(pos) == 2, f"Tier '{name}' text_position must be (x, y)"
            assert isinstance(pos[0], int) and isinstance(pos[1], int), f"Tier '{name}' text_position must be ints"

    def test_font_size_positive(self):
        for name, tier in TIERS.items():
            assert tier["font_size"] > 0, f"Tier '{name}' font_size must be positive"

    def test_max_text_width_positive(self):
        for name, tier in TIERS.items():
            assert tier["max_text_width"] > 0, f"Tier '{name}' max_text_width must be positive"

    def test_email_body_has_name_placeholder(self):
        for name, tier in TIERS.items():
            assert "{name}" in tier["email_body"], f"Tier '{name}' email_body must contain {{name}}"

    def test_smtp_host_is_string(self):
        assert isinstance(SMTP_HOST, str)
        assert len(SMTP_HOST) > 0

    def test_smtp_port_is_int(self):
        assert isinstance(SMTP_PORT, int)
        assert 1 <= SMTP_PORT <= 65535

    def test_cc_addresses_is_list(self):
        assert isinstance(CC_ADDRESSES, list)

    def test_font_color_is_rgb_tuple(self):
        assert isinstance(FONT_COLOR, tuple)
        assert len(FONT_COLOR) == 3
        assert all(0 <= c <= 255 for c in FONT_COLOR)

    def test_pill_color_is_rgba_tuple(self):
        assert isinstance(PILL_COLOR, tuple)
        assert len(PILL_COLOR) == 4
        assert all(0 <= c <= 255 for c in PILL_COLOR)

    def test_font_file_exists(self):
        assert os.path.exists(FONT_PATH), f"Font not found: {FONT_PATH}"

    def test_all_templates_exist(self):
        for name, tier in TIERS.items():
            assert os.path.exists(tier["template"]), f"Tier '{name}' template not found: {tier['template']}"

    def test_all_csvs_exist(self):
        for name, tier in TIERS.items():
            assert os.path.exists(tier["csv"]), f"Tier '{name}' CSV not found: {tier['csv']}"
