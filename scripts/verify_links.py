import re
import os
import sys

files_to_check = [
    "README.md",
    "docs/WORKFLOW.md",
    "docs/TEST_REPORT.md",
    "docs/SUBMISSION.md",
    "CHANGELOG.md"
]

all_passed = True
root_dir = os.path.abspath(".")

for rel_doc in files_to_check:
    doc_path = os.path.join(root_dir, rel_doc)
    if not os.path.exists(doc_path):
        print(f"ERROR: Document does not exist: {rel_doc}")
        all_passed = False
        continue

    with open(doc_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find markdown links: [text](path)
    # Ignore anchors (#...) and web URLs (http:// or https://)
    links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
    doc_dir = os.path.dirname(doc_path)

    print(f"\nChecking {rel_doc} ({len(links)} links)...")
    for text, link in links:
        link = link.strip()
        if link.startswith("#") or link.startswith("http://") or link.startswith("https://") or link.startswith("mailto:"):
            continue
        # Remove anchor if relative link has one: path#anchor
        link_file = link.split("#")[0]
        if not link_file:
            continue
        # Resolve path
        target_path = os.path.normpath(os.path.join(doc_dir, link_file))
        if not os.path.exists(target_path):
            print(f"  [BROKEN LINK] {text} -> {link} (Resolved: {target_path})")
            all_passed = False
        else:
            print(f"  [OK] {link}")

    # Find image links: ![alt](path)
    images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', content)
    for alt, img in images:
        img = img.strip()
        if img.startswith("http://") or img.startswith("https://"):
            continue
        target_path = os.path.normpath(os.path.join(doc_dir, img))
        if not os.path.exists(target_path):
            print(f"  [BROKEN IMAGE] {alt} -> {img} (Resolved: {target_path})")
            all_passed = False
        else:
            print(f"  [OK IMAGE] {img}")

if all_passed:
    print("\nALL LINKS AND IMAGES RESOLVE SUCCESSFULLY!")
else:
    print("\nSOME LINKS OR IMAGES ARE BROKEN!")
    sys.exit(1)
