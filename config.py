# Email addresses copied on every certificate email
CC_ADDRESSES = ["organizer@example.com", "co-organizer@example.com"]

# SMTP settings (Gmail default, change host/port for other providers)
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Font settings (applied to all tiers)
FONT_PATH = "fonts/PressStart2P-Regular.ttf"
FONT_COLOR = (255, 255, 255)  # RGB white

# Frosted-glass pill effect behind the name
PILL_COLOR = (15, 15, 15, 140)  # RGBA dark tint
PILL_PADDING_X = 84             # horizontal padding around text
PILL_PADDING_Y = 42             # vertical padding around text

# Certificate tiers — one entry per category.
# Duplicate the example below and adjust values for each tier.
#
# Keys:
#   csv             - path to CSV with columns: name, email
#   template        - path to the certificate template image
#   output_dir      - where generated PDFs are saved
#   cert_suffix     - appended to filename: <sanitized_name>_<cert_suffix>.pdf
#   text_position   - (x, y) pixel center where the name is drawn
#   font_size       - starting font size (auto-shrinks to fit)
#   max_text_width  - max pixel width before font shrinks
#   email_subject   - subject line for the certificate email
#   email_body      - plain text body, use {name} as placeholder
#
# To find text_position, run:
#   python find_position.py templates/your_template.jpg
TIERS = {
    "winner": {
        "csv": "data/winner.csv",
        "template": "templates/winner_template.jpg",
        "output_dir": "output/winner",
        "cert_suffix": "winner_certificate",
        "text_position": (1263, 675),
        "font_size": 66,
        "max_text_width": 1740,
        "email_subject": "Congratulations — You won!",
        "email_body": """\
Hi {name},

Congratulations! Your team took the top spot.

Your winner's certificate is attached. Frame it, post it — you earned it.

See you at the next one!

Best,
The Organizers\
""",
    },
    # "runner_up": {
    #     "csv": "data/runner_up.csv",
    #     "template": "templates/runner_up_template.jpg",
    #     "output_dir": "output/runner_up",
    #     "cert_suffix": "runner_up_certificate",
    #     "text_position": (1263, 675),
    #     "font_size": 66,
    #     "max_text_width": 1740,
    #     "email_subject": "Runner Up!",
    #     "email_body": """\
    # Hi {name},
    #
    # Your team finished Runner Up. That's a serious achievement.
    #
    # Your certificate is attached. Wear it well.
    #
    # Best,
    # The Organizers\
    # """,
    # },
    # "participants": {
    #     "csv": "data/participants.csv",
    #     "template": "templates/participant_template.jpg",
    #     "output_dir": "output/participants",
    #     "cert_suffix": "certificate",
    #     "text_position": (1263, 675),
    #     "font_size": 66,
    #     "max_text_width": 1740,
    #     "email_subject": "Your certificate",
    #     "email_body": """\
    # Hi {name},
    #
    # You showed up and built something. That alone puts you ahead.
    #
    # Your certificate is attached. See you at the next one!
    #
    # Best,
    # The Organizers\
    # """,
    # },
}
