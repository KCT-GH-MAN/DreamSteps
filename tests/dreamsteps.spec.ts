import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-05-29T19:30:00"));
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("ds-e2e-storage-cleared")) {
      window.localStorage.clear();
      window.sessionStorage.setItem("ds-e2e-storage-cleared", "true");
    }
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

test("edit habit sheet stays stable on fold and large phone viewports", async ({ page }) => {
  const monthlyHabit = {
    id: 4101,
    title: "Month close",
    iconName: "BookOpen",
    minutes: 25,
    completed: false,
    frequency: "monthly",
    daysOfWeek: [],
    daysOfMonth: [31],
  };
  const viewports = [
    { name: "fold cover", width: 402, height: 986 },
    { name: "large phone", width: 440, height: 956 },
  ];

  for (const viewport of viewports) {
    await test.step(viewport.name, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.setFixedTime(new Date("2026-05-31T08:30:00"));
      await page.addInitScript((habit) => {
        window.localStorage.setItem("ds-language", "en");
        window.localStorage.setItem("ds-welcome-seen", "true");
        window.localStorage.setItem("ds-last-active", "2026-05-31");
        window.localStorage.setItem("ds-habits", JSON.stringify([habit]));
      }, monthlyHabit);
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

      await page.getByRole("button", { name: /Edit Habit Month close/i }).click();
      const dialog = page.getByRole("dialog", { name: /Edit Habit/i });

      await expect(dialog).toBeVisible();
      await page.waitForTimeout(900);
      await expect(dialog.getByRole("button", { name: /Choose month day 31/i })).toBeVisible();

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

      const monthly = await measureDialog();

      await dialog.getByRole("button", { name: /Daily/i }).click();
      const daily = await measureDialog();

      await dialog.getByRole("button", { name: /Weekly/i }).click();
      const weekly = await measureDialog();

      await dialog.getByRole("button", { name: /Monthly/i }).click();
      const monthlyAgain = await measureDialog();

      for (const metrics of [monthly, daily, weekly, monthlyAgain]) {
        expect(metrics.overflowY).toBe("hidden");
        expect(metrics.scrollHeight).toBe(metrics.clientHeight);
        expect(metrics.height).toBeLessThanOrEqual(viewport.height - 8);
      }

      expect(Math.abs(monthly.height - daily.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(monthly.height - weekly.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(monthly.height - monthlyAgain.height)).toBeLessThanOrEqual(1);

      await page.mouse.click(10, 10);
    });
  }
});

test("validates the edit habit schedule before saving", async ({ page }) => {
  const weeklyHabit = {
    id: 4201,
    title: "Weekly planning",
    iconName: "BookOpen",
    minutes: 20,
    completed: false,
    frequency: "weekly",
    daysOfWeek: [5],
    daysOfMonth: [],
  };

  await page.addInitScript((habit) => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
    window.localStorage.setItem("ds-last-active", "2026-05-29");
    window.localStorage.setItem("ds-habits", JSON.stringify([habit]));
  }, weeklyHabit);
  await page.goto("/");

  await page.getByRole("button", { name: /Edit Habit Weekly planning/i }).click();
  const dialog = page.getByRole("dialog", { name: /Edit Habit/i });
  const saveButton = dialog.getByRole("button", { name: /Save Changes/i });

  await expect(dialog).toBeVisible();
  await expect(saveButton).toBeEnabled();

  await dialog.getByRole("button", { name: "Fri" }).click();
  await expect(saveButton).toBeDisabled();

  await dialog.getByRole("button", { name: "Fri" }).click();
  await expect(saveButton).toBeEnabled();
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

test("validates the add habit form before submit", async ({ page }) => {
  await page.getByRole("button", { name: /Thêm thói quen mới|Add a new habit/i }).click();

  const dialog = page.getByRole("dialog", { name: /Thói quen mới|New Habit/i });
  const titleInput = dialog.locator("input").first();
  const minutesInput = dialog.locator('input[type="number"]');
  const submitButton = dialog.getByRole("button", { name: /Tạo thói quen|Create Habit/i });

  await expect(dialog).toBeVisible();
  await expect(titleInput).toBeFocused();
  await expect(submitButton).toBeDisabled();

  await titleInput.fill("   ");
  await minutesInput.fill("10");
  await expect(submitButton).toBeDisabled();

  await titleInput.fill("Write notes");
  await minutesInput.fill("0");
  await expect(submitButton).toBeDisabled();

  await minutesInput.fill("15");
  await expect(submitButton).toBeEnabled();

  await submitButton.click();
  await expect(page.getByText("Write notes")).toBeVisible();
});

test("shows starter suggestions when no habits exist", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
    window.localStorage.setItem("ds-last-active", "2026-05-29");
    window.localStorage.setItem("ds-habits", JSON.stringify([]));
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Today Habits/i })).toBeVisible();
  await expect(page.getByText("Start with one very small step")).toBeVisible();
  await expect(page.getByText("Quick suggestions")).toBeVisible();

  await page.getByRole("button", { name: /Read 10 minutes/i }).click();

  const dialog = page.getByRole("dialog", { name: /New Habit/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("input").first()).toHaveValue("Read 10 minutes");
  await expect(dialog.locator('input[type="number"]')).toHaveValue("10");
});

test("explains when existing habits are not scheduled today", async ({ page }) => {
  const notDueHabits = [
    {
      id: 5101,
      title: "Monday review",
      iconName: "BookOpen",
      minutes: 20,
      completed: false,
      frequency: "weekly",
      daysOfWeek: [1],
      daysOfMonth: [],
    },
    {
      id: 5102,
      title: "Month end close",
      iconName: "CalendarDays",
      minutes: 15,
      completed: false,
      frequency: "monthly",
      daysOfWeek: [],
      daysOfMonth: [31],
    },
  ];

  await page.clock.setFixedTime(new Date("2026-04-29T08:30:00"));
  await page.addInitScript((habits) => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
    window.localStorage.setItem("ds-last-active", "2026-04-29");
    window.localStorage.setItem("ds-habits", JSON.stringify(habits));
  }, notDueHabits);
  await page.goto("/");

  await expect(page.getByText("Nothing is scheduled for today")).toBeVisible();
  await expect(page.getByText("Not Today")).toBeVisible();
  await expect(page.getByText("Monday review")).toBeVisible();
  await expect(page.getByText("Month end close")).toBeVisible();
  await expect(page.getByText(/Next: Mon,/i)).toBeVisible();
  await expect(page.getByText(/Next:.*month end/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Edit habit schedule Monday review/i })).toBeVisible();
});

test("runs monthly habits on the last day of shorter months", async ({ page }) => {
  const monthlyHabit = {
    id: 3101,
    title: "Month end review",
    iconName: "CalendarDays",
    minutes: 20,
    completed: false,
    frequency: "monthly",
    daysOfWeek: [],
    daysOfMonth: [31],
  };

  const cases = [
    { date: "2026-04-30T08:30:00", today: "2026-04-30" },
    { date: "2026-02-28T08:30:00", today: "2026-02-28" },
  ];

  for (const item of cases) {
    await test.step(item.today, async () => {
      await page.clock.setFixedTime(new Date(item.date));
      await page.goto("/");
      await page.evaluate(
        ({ habit, today }) => {
          window.localStorage.setItem("ds-welcome-seen", "true");
          window.localStorage.setItem("ds-last-active", today);
          window.localStorage.setItem("ds-habits", JSON.stringify([habit]));
        },
        { habit: monthlyHabit, today: item.today }
      );
      await page.reload();

      await expect(page.getByRole("heading", { name: /Thói quen hôm nay|Today/i })).toBeVisible();
      await expect(page.getByText("Month end review")).toBeVisible();
      await expect(page.getByText(/20/)).toBeVisible();
      await expect(page.getByText(/Hằng tháng.*31|Monthly.*31/i)).toBeVisible();
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

test("rejects invalid backup imports without replacing data", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
    window.localStorage.setItem(
      "ds-habits",
      JSON.stringify([
        {
          id: 6101,
          title: "Keep me",
          iconName: "BookOpen",
          minutes: 12,
          completed: false,
          frequency: "daily",
          daysOfWeek: [],
          daysOfMonth: [],
        },
      ])
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Stats/i }).click();

  await page.locator('input[type="file"]').setInputFiles({
    name: "broken-dreamsteps-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        app: "DreamSteps",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          "ds-habits": JSON.stringify([{ title: "Broken habit" }]),
        },
      })
    ),
  });

  await expect(page.getByText(/Invalid backup file/i)).toBeVisible();

  const storedHabits = await page.evaluate(() => window.localStorage.getItem("ds-habits"));
  expect(storedHabits).toContain("Keep me");
  expect(storedHabits).not.toContain("Broken habit");
});

test("previews and restores a valid backup import", async ({ page }) => {
  const backup = {
    app: "DreamSteps",
    version: 1,
    exportedAt: "2026-05-29T10:00:00.000Z",
    data: {
      "ds-language": "en",
      "ds-welcome-seen": "true",
      "ds-last-active": "2026-05-29",
      "ds-habits": JSON.stringify([
        {
          id: 6201,
          title: "Restored habit",
          iconName: "BookOpen",
          minutes: 18,
          completed: false,
          frequency: "daily",
          daysOfWeek: [],
          daysOfMonth: [],
        },
      ]),
      "ds-analytics": JSON.stringify({
        days: [{ date: "2026-05-29", focusedMinutes: 18, completedHabits: 1 }],
      }),
      "ds-habit-history": JSON.stringify({
        "6201": [
          { date: "2026-05-29", minutes: 18, completedAt: "2026-05-29T10:30:00.000Z" },
        ],
      }),
      "ds-reflections": JSON.stringify([
        { date: "2026-05-29", intent: "Restore", win: "", blocker: "", mood: null },
      ]),
      "ds-timeline": JSON.stringify([
        { id: 1, type: "habit", title: "Restored habit", minutes: 18, createdAt: "2026-05-29T10:30:00.000Z" },
      ]),
      "ds-reminder-settings": JSON.stringify({
        enabled: false,
        time: "21:00",
        morningTime: "06:00",
        eveningTime: "21:00",
        reengageAfterDays: 3,
        lastSentDate: null,
        lastMorningSentDate: null,
        lastEveningSentDate: null,
      }),
    },
  };

  await page.addInitScript(() => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
    window.localStorage.setItem("ds-habits", JSON.stringify([]));
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Stats/i }).click();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Habits: 1");
    expect(dialog.message()).toContain("Analytics days: 1");
    expect(dialog.message()).toContain("History entries: 1");
    expect(dialog.message()).toContain("Reflections: 1");
    expect(dialog.message()).toContain("Timeline entries: 1");
    await dialog.accept();
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: "dreamsteps-backup-valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });

  await expect(page.getByText(/Backup data imported/i)).toBeVisible();
  await page.getByRole("button", { name: /Home/i }).click();
  await expect(page.getByText("Restored habit")).toBeVisible();
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

test("shows reminder health details and validates reengage days", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
  });
  await page.route("**/api/push/public-key", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ publicKey: "test-public-key" }),
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Stats/i }).click();

  await expect(page.getByText(/Daily Reminder|NhбєЇc nhб»џ hбє±ng ngГ y/i)).toBeVisible();
  await expect(page.getByText(/Notifications|ThГґng bГЎo/i)).toBeVisible();
  await expect(page.getByText(/Permission|Quyб»Ѓn/i)).toBeVisible();
  await expect(page.getByText(/Background push|Push nб»Ѓn/i)).toBeVisible();
  await expect(page.getByText(/Server key|KhГіa server/i)).toBeVisible();
  await expect(page.getByText(/Last reminder|Lбє§n nhбєЇc gбє§n nhбєҐt/i)).toBeVisible();
  await expect(page.getByText(/Ready|Sбєµn sГ ng/i).first()).toBeVisible();

  const reengageInput = page.locator('input[type="number"]');
  await expect(reengageInput).toHaveValue("3");
  await reengageInput.fill("0");
  await expect(reengageInput).toHaveValue("3");
});

test("normalizes incomplete reminder settings", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("ds-language", "en");
    window.localStorage.setItem("ds-welcome-seen", "true");
    window.localStorage.setItem(
      "ds-reminder-settings",
      JSON.stringify({
        enabled: true,
        time: "20:15",
        reengageAfterDays: 99,
      })
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Stats/i }).click();

  const morningInput = page.locator('input[type="time"]').first();
  const eveningInput = page.locator('input[type="time"]').nth(1);
  const reengageInput = page.locator('input[type="number"]');

  await expect(morningInput).toHaveValue("06:00");
  await expect(eveningInput).toHaveValue("20:15");
  await expect(reengageInput).toHaveValue("3");
  await expect(page.getByText("On", { exact: true })).toBeVisible();
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
