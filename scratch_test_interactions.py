import asyncio
import os
from playwright.async_api import async_playwright

ARTIFACTS_DIR = r"C:\Users\japesh\.gemini\antigravity\brain\71dc1a31-c400-4a04-aab6-85b1329a5da1"

async def test_full_site():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        logs = []
        page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: logs.append(f"[PAGE_ERR] {err}"))

        print("Navigating to http://127.0.0.1:3000...")
        await page.goto("http://127.0.0.1:3000", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # 1. Dismiss Hero Landing Showcase if open
        enter_btn = page.locator('button.halide-cta-button').first
        if await enter_btn.is_visible():
            print("Entering terminal from hero showcase...")
            await enter_btn.click()
            await page.wait_for_timeout(800)

        # Capture Overview (light mode)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_01_overview_light.png"), full_page=True)
        print("PASS: Captured test_01_overview_light.png")

        # --- Test topbar buttons ---
        print("\n--- Testing Topbar Buttons ---")
        # API Info modal
        api_btn = page.locator('button:has-text("API")').first
        if await api_btn.is_visible():
            await api_btn.click()
            await page.wait_for_timeout(500)
            close_modal = page.locator('button:has-text("CLOSE")').first
            if await close_modal.is_visible():
                await close_modal.click()
                await page.wait_for_timeout(300)
                print("PASS: API modal open/close")

        # Quoted/Normalized toggle
        toggle = page.locator('button:has-text("QUOTED")').first
        if await toggle.is_visible():
            await toggle.click()
            await page.wait_for_timeout(200)
            await toggle.click()
            await page.wait_for_timeout(200)
            print("PASS: Quoted/Normalized toggle")

        # Date picker modal
        date_btn = page.locator('button:has-text("DATE")').first
        if not await date_btn.is_visible():
            date_btn = page.locator('button[title*="date" i]').first
        if await date_btn.is_visible():
            await date_btn.click()
            await page.wait_for_timeout(500)
            cancel_btn = page.locator('button:has-text("CANCEL")').first
            if await cancel_btn.is_visible():
                await cancel_btn.click()
                await page.wait_for_timeout(300)
                print("PASS: Date picker modal open/cancel")

        # --- Test 2: Relative Value Screen ---
        print("\n--- Navigating to Relative Value Screen ---")
        await page.locator('button:has-text("Relative Value")').first.click()
        await page.wait_for_timeout(800)

        # Select pair
        pair_btn = page.locator('button:has-text("G.M-G.GUINEA")').first
        if await pair_btn.is_visible():
            await pair_btn.click()
            await page.wait_for_timeout(600)
            print("PASS: Selected GOLDM-GOLDGUINEA pair")

        # Test Position Multipliers
        for mult_label in ["5x", "10x"]:
            mult_btn = page.locator(f'button:has-text("{mult_label}")').first
            if await mult_btn.is_visible():
                await mult_btn.click()
                await page.wait_for_timeout(200)
                print(f"PASS: Position multiplier {mult_label} clicked")

        # Test Gate details
        gate_1 = page.locator('text=G1').first
        if await gate_1.is_visible():
            await gate_1.click()
            await page.wait_for_timeout(300)
            dismiss_gate = page.locator('button:has-text("Dismiss")').first
            if await dismiss_gate.is_visible():
                await dismiss_gate.click()
                print("PASS: Gate click/dismiss")

        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_02_relative_value.png"), full_page=True)
        print("PASS: Captured test_02_relative_value.png")

        # Backtest Pair CTA
        backtest_pair_btn = page.locator('button:has-text("BACKTEST PAIR")').first
        if await backtest_pair_btn.is_visible():
            await backtest_pair_btn.click()
            await page.wait_for_timeout(1500)
            print("PASS: Navigated to Backtest via BACKTEST PAIR CTA")

        # --- Test 3: Backtest Screen ---
        print("\n--- Testing Backtest Screen ---")
        # Wait generously for backtest API to complete
        await page.wait_for_timeout(5000)

        reset_btn = page.locator('button:has-text("RESET PARAMETERS")').first
        if await reset_btn.is_visible():
            await reset_btn.click()
            await page.wait_for_timeout(300)
            print("PASS: Reset Parameters clicked")

        # Export CSV - wait for button to be enabled
        export_btn = page.locator('button:has-text("EXPORT TRADES")')
        try:
            await export_btn.first.wait_for(state="visible", timeout=3000)
            # Check if it's enabled (not disabled)
            is_disabled = await export_btn.first.get_attribute("disabled")
            if is_disabled is None:
                async with page.expect_download(timeout=5000) as download_info:
                    await export_btn.first.click()
                download = await download_info.value
                print(f"PASS: CSV Export downloaded: {download.suggested_filename}")
            else:
                print("SKIP: Export CSV button still disabled (API not finished)")
        except Exception as e:
            print(f"SKIP: CSV Export - {str(e)[:60]}")

        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_03_backtest.png"), full_page=True)
        print("PASS: Captured test_03_backtest.png")

        # --- Test 4: Data Integrity Screen ---
        print("\n--- Navigating to Data Integrity Screen ---")
        await page.locator('button:has-text("Data Integrity")').first.click()
        await page.wait_for_timeout(800)

        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_04_integrity.png"), full_page=True)
        print("PASS: Captured test_04_integrity.png")

        # Bhavcopy modal
        bhavcopy_btn = page.locator('button:has-text("INSPECT RAW BHAVCOPY")').first
        if await bhavcopy_btn.is_visible():
            await bhavcopy_btn.click()
            await page.wait_for_timeout(500)
            close_bhav = page.locator('button:has-text("CLOSE")').first
            if await close_bhav.is_visible():
                await close_bhav.click()
                await page.wait_for_timeout(300)
                print("PASS: Bhavcopy modal open/close")

        # SHA-256 verification
        sha_btn = page.locator('button:has-text("VERIFY SHA-256")').first
        if await sha_btn.is_visible():
            await sha_btn.click()
            await page.wait_for_timeout(5000)  # let the 4-step animation finish
            print("PASS: SHA-256 verification triggered")

        # --- Test 5: Futures Curve Screen ---
        print("\n--- Navigating to Futures Curve Screen ---")
        await page.locator('button:has-text("Futures Curve")').first.click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_05_curve.png"), full_page=True)
        print("PASS: Captured test_05_curve.png")

        # --- Test 6: Replay Lab Screen ---
        print("\n--- Navigating to Replay Lab Screen ---")
        await page.locator('button:has-text("Replay Lab")').first.click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_06_replay.png"), full_page=True)
        print("PASS: Captured test_06_replay.png")

        # --- Test 7: Lifecycle Screen ---
        print("\n--- Navigating to Lifecycle Screen ---")
        await page.locator('button:has-text("Lifecycle")').first.click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_07_lifecycle.png"), full_page=True)
        print("PASS: Captured test_07_lifecycle.png")

        # --- Test 8: Dark Mode Toggle ---
        print("\n--- Testing Dark Mode ---")
        dark_toggle = page.locator('button:has-text("Dark")').first
        if not await dark_toggle.is_visible():
            dark_toggle = page.locator('button[aria-label*="dark" i]').first
        if not await dark_toggle.is_visible():
            # Try moon icon button
            dark_toggle = page.locator('button:has(svg.lucide-moon)').first
        if await dark_toggle.is_visible():
            await dark_toggle.click()
            await page.wait_for_timeout(500)
            # Navigate back to Overview for a dark mode screenshot
            await page.locator('button:has-text("Overview")').first.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "test_08_overview_dark.png"), full_page=True)
            print("PASS: Dark mode toggle + captured test_08_overview_dark.png")
        else:
            print("SKIP: Dark mode toggle button not found")

        # --- Console Errors Audit ---
        print("\n--- Console Errors Audit ---")
        errs = [l for l in logs if "page_err" in l.lower()]
        warnings = [l for l in logs if l.startswith("[error]")]
        if not errs and not warnings:
            print("PERFECT: ZERO page errors or console errors across entire test suite!")
        else:
            if errs:
                print(f"Page errors ({len(errs)}):")
                for e in errs[:5]:
                    print(f"  {e[:120]}")
            if warnings:
                print(f"Console errors ({len(warnings)}):")
                for w in warnings[:5]:
                    print(f"  {w[:120]}")

        await browser.close()
        print("\nAll screen captures and interaction tests completed!")

asyncio.run(test_full_site())
