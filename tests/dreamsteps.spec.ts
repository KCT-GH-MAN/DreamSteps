import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-05-29T19:30:00"));
  await page.addInitScript(() => {
    window.localStorage.setItem("ds-welcome-seen", "true");
  });
  await page.goto("/");
});

test("loads the DreamSteps home screen", async ({ page }) => {
  await expect(page).toHaveTitle(/DreamSteps/);
  await expect(page.getByRole("heading", { name: "DreamSteps" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Thêm thói quen mới|Add a new habit/i })).toBeVisible();
});

test("can switch to stats tab", async ({ page }) => {
  await page.getByRole("button", { name: /Thống kê|Stats/i }).click();

  await expect(page.getByRole("heading", { name: /Thống kê|Stats/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Heatmap/i })).toBeVisible();
});

test("can edit an existing habit", async ({ page }) => {
  await page.getByRole("button", { name: /Sửa thói quen|Edit habit/i }).first().click();

  const editDialog = page.getByRole("dialog", { name: /Sửa thói quen|Edit Habit/i });

  await expect(editDialog.getByRole("heading", { name: /Sửa thói quen|Edit Habit/i })).toBeVisible();

  await editDialog.locator("input").first().fill("Read deeply");
  await editDialog.locator('input[type="number"]').fill("15");
  await editDialog.getByRole("button", { name: /Lưu thay đổi|Save Changes/i }).click();

  await expect(page.getByText("Read deeply")).toBeVisible();
  await expect(page.getByText(/15/)).toBeVisible();
});

test("habit sheet stays stable on fold and large phone viewports", async ({ page }) => {
  const viewports = [
    { name: "fold cover", width: 402, height: 986 },
    { name: "large phone", width: 440, height: 956 },
  ];

  for (const viewport of viewports) {
    await test.step(viewport.name, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            scroll-behavior: auto !important;
          }
        `,
      });

      await page.getByRole("button", { name: /Thêm thói quen mới|Add a new habit/i }).click();
      const dialog = page.getByRole("dialog", { name: /Thói quen mới|New Habit/i });

      await expect(dialog).toBeVisible();
      await page.waitForTimeout(900);

      const measureDialog = async () => {
        return dialog.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);

          return {
            height: rect.height,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            overflowY: style.overflowY,
          };
        });
      };

      const daily = await measureDialog();

      await dialog.getByRole("button", { name: /Hằng tuần|Weekly/i }).click();
      const weekly = await measureDialog();

      await dialog.getByRole("button", { name: /Hằng tháng|Monthly/i }).click();
      const monthly = await measureDialog();

      await expect(dialog.getByRole("button", { name: /Choose month day 29/i })).toBeVisible();
      await dialog.getByRole("button", { name: /Next month day/i }).click();
      await expect(dialog.getByRole("button", { name: /Choose month day 30/i })).toBeVisible();

      const text = await dialog.innerText();
      expect(text).not.toMatch(/\b1\s+2\s+3\s+4\s+5\s+6\s+7\s+8\s+9\s+10\b/);

      for (const metrics of [daily, weekly, monthly]) {
        expect(metrics.overflowY).toBe("hidden");
        expect(metrics.scrollHeight).toBe(metrics.clientHeight);
        expect(metrics.height).toBeLessThanOrEqual(viewport.height - 8);
      }

      expect(Math.abs(daily.height - weekly.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(daily.height - monthly.height)).toBeLessThanOrEqual(1);

      await page.mouse.click(10, 10);
    });
  }
});

test("records and shows habit history", async ({ page }) => {
  await page.getByRole("button", { name: /Hoàn thành thói quen|Complete habit/i }).first().click();
  await page.getByRole("button", { name: /Xem lịch sử|View history/i }).first().click();

  const historyDialog = page.getByRole("dialog", {
    name: /Lịch sử thói quen|Habit History/i,
  });

  await expect(historyDialog).toBeVisible();
  await expect(historyDialog.getByText(/Lần xong|Done/i)).toBeVisible();
  await expect(historyDialog.getByText(/Tổng phút|Total min/i)).toBeVisible();
  await expect(historyDialog.getByText(/14 ngày gần đây|Last 14 days/i)).toBeVisible();
  await expect(historyDialog.getByText("1").first()).toBeVisible();
});

test("can export a data backup", async ({ page }) => {
  await page.getByRole("button", { name: /Thống kê|Stats/i }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Xuất dữ liệu|Export Data/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^dreamsteps-backup-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByText(/Đã xuất file sao lưu|Backup file exported/i)).toBeVisible();
});

test("shows daily reminder settings", async ({ page }) => {
  await page.getByRole("button", { name: /Thống kê|Stats/i }).click();

  await expect(page.getByText(/Nhắc nhở hằng ngày|Daily Reminder/i)).toBeVisible();

  const morningInput = page.locator('input[type="time"]').first();
  const eveningInput = page.locator('input[type="time"]').nth(1);

  await expect(morningInput).toHaveValue("06:00");
  await expect(eveningInput).toHaveValue("21:00");
  await morningInput.fill("07:30");
  await eveningInput.fill("20:45");
  await expect(morningInput).toHaveValue("07:30");
  await expect(eveningInput).toHaveValue("20:45");
  await expect(page.locator('input[type="number"]')).toHaveValue("3");
  await expect(page.getByRole("button", { name: /Bật nhắc|Enable/i })).toBeVisible();
});

test("completes a habit when its focus session finishes", async ({ page }) => {
  await page.goto("/?testFocus=1");

  await page.getByRole("button", { name: /Bắt đầu tập trung|Start Focus Session/i }).first().click();
  await page.getByRole("button", { name: /Bắt đầu phiên focus|Start focus session/i }).click();
  await expect(page.getByText(/Bạn đã làm được rồi|You did it/i)).toBeVisible({
    timeout: 5000,
  });
  await page.getByRole("button", { name: /Tiếp tục nào|Keep going/i }).click();

  await expect(page.getByRole("button", { name: /Hoàn thành thói quen|Complete habit/i }).first()).toHaveClass(/text-\[#7EE2B8\]/);
});

test("home screen visual snapshot", async ({ page }) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });

  await expect(page.locator("main")).toHaveScreenshot("home-screen.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
  });
});
