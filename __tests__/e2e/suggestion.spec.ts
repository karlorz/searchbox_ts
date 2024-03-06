import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("IMDB search box");
});

test("Empty search term", async ({ page }) => {
  await page.goto("/");

  // Verify that no suggestions are displayed initially
  const suggestionsContainer = await page.$("#suggestions");
  expect(suggestionsContainer).toBe(null);

  // Submit an empty search term
  const searchBox = await page.waitForSelector("#searchbox");
  await searchBox.type("");

  // Verify that no suggestions are displayed
  expect(await page.isVisible("#suggestions")).toBe(false);
});

test('Search with short query', async ({ page }) => {
  await page.goto('/');

  // Submit a search term with less than three characters
  const searchBox = await page.waitForSelector('#searchbox');
  await searchBox.type('ab');

  // Verify that no suggestions are displayed
  expect(await page.isVisible('#suggestions')).toBe(false);
});

test("Movie suggestions", async ({ page }) => {
  await page.goto("/");

  // Submit a search term for a movie
  const searchBox = await page.waitForSelector("#searchbox");
  await searchBox.type("The God");

  // Wait for the suggestions to appear
  await page.waitForSelector("#suggestions");

  // Verify that movie suggestions are displayed
  const movieSuggestions = await page.$$(
    '#suggestions h3:text("Movies") + ul li');
  expect(movieSuggestions.length).toBeGreaterThan(0);

  // Verify that the suggestions contain the search term
  for (const suggestion of movieSuggestions) {
    const suggestionText = await suggestion.innerText();
    expect(suggestionText.toLowerCase()).toContain("the god");
  }

  // Verify that there are no TV show suggestions
  const tvShowSuggestions = await page.$$(
    '#suggestions h3:text("TV Shows") + ul li'
  );
  expect(tvShowSuggestions.length).toBeGreaterThan(0);
});
