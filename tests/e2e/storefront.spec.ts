import {test, expect, type Page} from '@playwright/test';

const pathOf = (page: Page) => new URL(page.url()).pathname;
const money = (value: string) => {
  const match = value.match(/(\d[\d.,\s]*)(?=\s*€)/);
  if (!match) throw new Error('Kein EUR-Preis gefunden: ' + value);
  const raw = match[1].replace(/\s/g, '');
  return Number(raw.replace(/\./g, '').replace(',', '.'));
};

async function openDia(page: Page) {
  await page.goto('/products/dia');
  await expect(page.locator('.product-form')).toBeVisible();
  await expect(page.locator('.cta-price')).toContainText('€');
}

test('Navigation: Menu, interne Links und Browser-Zurück', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Toggle menu'}).click();
  const menu = page.locator('.header__overlay.open');
  await expect(menu).toBeVisible();
  await menu.getByRole('link', {name: /PROJECTS/i}).first().click();
  await expect(page).toHaveURL(/\/projects(?:\?|$)/);
  await expect(page.locator('.collections.highlights')).toBeVisible();
  await page.goBack();
  expect(pathOf(page)).toBe('/');
  await page.getByRole('button', {name: 'Toggle menu'}).click();
  await page.locator('.header__overlay.open').getByRole('link', {name: /BESPOKE/i}).first().click();
  await expect(page).toHaveURL(/\/bespoke(?:\?|$)/);
});

test('Produkt: Bild, Variantenwahl, URL und positiver Preis', async ({page}) => {
  await openDia(page);
  const media = page.locator('.product-main__media img').first();
  await expect(media).toBeVisible();
  await expect.poll(() => media.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
  const original = money(await page.locator('.cta-price').innerText());
  expect(original).toBeGreaterThan(0);

  const height = page.locator('.cfg-row').filter({has: page.locator('.cfg-label', {hasText: /^Height$/})});
  await expect(height.getByRole('button', {name: '45 cm'})).toBeVisible();
  await height.getByRole('button', {name: '45 cm'}).click();
  await expect(page).toHaveURL(/Metal.Rod=H.45.cm/i);
  await expect(height.getByRole('button', {name: '45 cm'})).toHaveAttribute('aria-pressed', 'true');

  const rods = page.locator('.cfg-row').filter({has: page.locator('.cfg-label', {hasText: /^Metal Rod$/})});
  await rods.getByRole('button', {name: 'Stainless Steel'}).click();
  await expect(page).toHaveURL(/Metal.Rod=H.45.cm.Silver/i);
  await expect(rods.getByRole('button', {name: 'Stainless Steel'})).toHaveAttribute('aria-pressed', 'true');
  expect(money(await page.locator('.cta-price').innerText())).toBeGreaterThan(0);
});

test('Warenkorb: korrekte Variante, Stückpreis und Menge', async ({page}) => {
  await openDia(page);
  const rods = page.locator('.cfg-row').filter({has: page.locator('.cfg-label', {hasText: /^Metal Rod$/})});
  await rods.getByRole('button', {name: 'Brass'}).click();
  await expect(page).toHaveURL(/Metal.Rod=H.\d+.cm.Brass/i);
  const expectedPrice = money(await page.locator('.cta-price').innerText());
  const expectedRod = new URL(page.url()).searchParams.get('Metal Rod');
  expect(expectedRod).toBeTruthy();

  await page.getByRole('button', {name: 'Add to Cart'}).click();
  const dialog = page.locator('.overlay.expanded[data-aside-type="cart"]');
  await expect(dialog).toBeVisible();
  const line = dialog.locator('.cart-line').first();
  await expect(line).toBeVisible({timeout: 20_000});
  await expect(line.locator('.cart-line__meta')).toContainText(expectedRod!);
  const unitPrice = money(await line.locator('.cart-line__unit-price').innerText());
  expect(unitPrice).toBeCloseTo(expectedPrice, 2);
  await expect(line.locator('.qty-value')).toHaveText('1');
  await line.getByRole('button', {name: 'Increase quantity'}).click();
  await expect(line.locator('.qty-value')).toHaveText('2', {timeout: 20_000});
});

test('Mobile: Header, Konfigurator, Cart und Footer ohne horizontales Overflow', async ({page, isMobile}) => {
  test.skip(!isMobile, 'Nur auf Mobile relevant');
  await page.goto('/');
  await expect(page.locator('header.header')).toBeVisible();
  await page.getByRole('button', {name: 'Toggle menu'}).click();
  await expect(page.locator('.header__overlay.open')).toBeVisible();
  await page.getByRole('button', {name: 'Toggle menu'}).click();
  await openDia(page);
  await expect(page.locator('.configurator')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Add to Cart'})).toBeVisible();
  await page.goto('/cart');
  await expect(page.locator('.cart-main')).toBeVisible();
  await page.goto('/projects');
  await expect(page.locator('footer').first()).toBeAttached();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'Horizontales Scrollen auf Mobile').toBeLessThanOrEqual(2);
});

for (const [path, className] of [['/bespoke', 'bespoke'], ['/projects', 'highlights']] as const) {
  test(`${path}: Bilder, Grid und Hoverwechsel`, async ({page, isMobile}) => {
    await page.goto(path);
    const grid = page.locator(`.collections.${className} .collections-grid`);
    await expect(grid).toBeVisible();
    const cards = grid.locator('.product-item');
    expect(await cards.count()).toBeGreaterThan(0);
    const first = cards.first();
    await expect(first.locator('.card__img--primary')).toBeVisible();
    const columns = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    if (!isMobile) {
      expect(columns.trim().split(/\s+/).length).toBe(2);
    } else {
      expect(await grid.evaluate(el => getComputedStyle(el).display)).toBe('block');
    }
    const withHover = cards.filter({has: page.locator('.card__img--secondary')}).first();
    if (await withHover.count()) {
      await withHover.hover();
      await expect(withHover.locator('.card__img--secondary')).toHaveCSS('opacity', '1');
      await expect(withHover.locator('.card__img--primary')).toHaveCSS('opacity', '0');
    }
  });
}

test('Content: offensichtliche Testtitel und Platzhalter erkennen', async ({page}) => {
  for (const route of ['/bespoke', '/projects']) {
    await page.goto(route);
    const titles = await page.locator('.product-caption').allInnerTexts();
    expect(titles.length, `Keine Projekte in ${route}`).toBeGreaterThan(0);
    const suspicious = titles.filter(text =>
      /(?:titel?\s+(?:unter\s+bild|querformat|hochformat)|\btest\b|\bkopie\b|\bcopy\s*\d+\b|\blorem\b|\bplaceholder\b)/i.test(text)
    );
    expect(suspicious, `Test- oder Platzhalterdaten in ${route}`).toEqual([]);
  }
});
