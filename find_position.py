"""
Run this to find the pixel coordinates for name placement.
Click anywhere on the template — coordinates print to terminal.
Close the window when done, then update TEXT_POSITION in config.py.

Usage:
    python find_position.py templates/winner_template.jpg

If tkinter isn't available: brew install python-tk
"""
import sys
import tkinter as tk
from PIL import Image, ImageTk


def main():
    template = sys.argv[1] if len(sys.argv) > 1 else "template.png"
    img = Image.open(template)
    orig_w, orig_h = img.size

    root = tk.Tk()
    root.title("Click where the name should be centered — Q to quit")

    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight() - 80
    scale = min(screen_w / orig_w, screen_h / orig_h, 1.0)
    display_w = int(orig_w * scale)
    display_h = int(orig_h * scale)

    display_img = img.resize((display_w, display_h), Image.LANCZOS)
    photo = ImageTk.PhotoImage(display_img)

    canvas = tk.Canvas(root, width=display_w, height=display_h, cursor="crosshair")
    canvas.pack()
    canvas.create_image(0, 0, anchor="nw", image=photo)

    info = tk.Label(root, text="Click on the template to get coordinates", font=("Arial", 12), pady=6)
    info.pack()

    def on_click(event):
        x = int(event.x / scale)
        y = int(event.y / scale)
        print(f"Clicked: ({x}, {y})")
        print(f"  → set in config.py:  TEXT_POSITION = ({x}, {y})")
        info.config(text=f"TEXT_POSITION = ({x}, {y})  — click again to refine")

    canvas.bind("<Button-1>", on_click)
    root.bind("<q>", lambda _: root.destroy())
    root.mainloop()


if __name__ == "__main__":
    main()
