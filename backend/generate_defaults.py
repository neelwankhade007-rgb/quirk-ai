import os

avatars = {
    "default-anime-female": "#FFB6C1",
    "default-anime-male": "#87CEFA",
    "default-fantasy-female": "#DDA0DD",
    "default-fantasy-male": "#20B2AA",
    "default-cyberpunk": "#FF00FF",
    "default-warrior": "#CD5C5C",
    "default-mage": "#9370DB",
    "default-student": "#F0E68C",
    "default-sci-fi": "#00CED1",
    "default-mysterious": "#708090",
    "default-cute": "#FF69B4",
    "default-creature": "#32CD32"
}

svg_template = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="{color}"/>
  <text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#fff" dominant-baseline="middle" text-anchor="middle">{name}</text>
</svg>"""

os.makedirs("defaults", exist_ok=True)
for name, color in avatars.items():
    with open(f"defaults/{name}.svg", "w") as f:
        short_name = name.replace("default-", "")
        f.write(svg_template.format(color=color, name=short_name))

print("Default SVGs generated.")
