import os
import time
import shutil
from playwright.sync_api import sync_playwright

DOCS_DIR = "docs/rehearsal"
ARTIFACT_DIR = r"C:\Users\japesh\.gemini\antigravity\brain\71dc1a31-c400-4a04-aab6-85b1329a5da1"

def rehearse_full_demo():
    os.makedirs(DOCS_DIR, exist_ok=True)
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("1. Opening terminal overview...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(DOCS_DIR, "01_overview.png"))

        print("2. Triggering Normalization Stage...")
        page.click("text=NORMALIZE CONTRACTS")
        time.sleep(5)  # Wait for 5-phase choreography to settle
        page.screenshot(path=os.path.join(DOCS_DIR, "02_normalization.png"))

        print("3. Navigating to Futures Curve...")
        page.click("text=Futures Curve")
        time.sleep(2)
        page.screenshot(path=os.path.join(DOCS_DIR, "03_futures_curve.png"))

        print("4. Navigating to Relative Value...")
        page.click("text=Relative Value")
        time.sleep(2)
        page.screenshot(path=os.path.join(DOCS_DIR, "04_relative_value.png"))

        print("5. Navigating to Replay Lab...")
        page.click("text=Replay Lab")
        time.sleep(1)
        try:
            page.locator("button:has-text('PLAY')").first.click(timeout=3000)
            time.sleep(2)
        except Exception as e:
            print("Play button optional click:", e)
        page.screenshot(path=os.path.join(DOCS_DIR, "05_replay_lab.png"))

        print("6. Navigating to Backtest...")
        page.click("text=Backtest")
        time.sleep(2)
        page.screenshot(path=os.path.join(DOCS_DIR, "06_backtest.png"))

        print("7. Navigating to Lifecycle...")
        page.click("text=Lifecycle")
        time.sleep(2)
        page.screenshot(path=os.path.join(DOCS_DIR, "07_lifecycle.png"))

        print("8. Navigating to Data Integrity...")
        page.click("text=Data Integrity")
        time.sleep(2)
        page.screenshot(path=os.path.join(DOCS_DIR, "08_data_integrity.png"))

        print("9. Capturing Showcase Hero Modal...")
        try:
            page.locator("button:has-text('Showcase')").click(timeout=3000)
            time.sleep(1.5)
            page.screenshot(path=os.path.join(DOCS_DIR, "09_showcase_hero.png"))
            page.keyboard.press("Escape")
            time.sleep(1)
        except Exception as e:
            print("Showcase hero optional capture:", e)

        print("10. Testing Dark Mode Toggle...")
        try:
            page.click("button[title*='Deep Charcoal'], button[title*='Warm Ivory']", timeout=3000)
            time.sleep(1)
            page.click("text=Overview")
            time.sleep(1)
            page.screenshot(path=os.path.join(DOCS_DIR, "10_overview_dark.png"))
        except Exception as e:
            print("Dark mode toggle optional capture:", e)

        browser.close()
        print("Rehearsal finished successfully!")

    # Copy screenshots to artifact directory for presentation
    for fname in os.listdir(DOCS_DIR):
        if fname.endswith(".png"):
            src = os.path.join(DOCS_DIR, fname)
            dst = os.path.join(ARTIFACT_DIR, fname)
            shutil.copy2(src, dst)
            print(f"Copied {fname} to artifacts.")

if __name__ == "__main__":
    rehearse_full_demo()
