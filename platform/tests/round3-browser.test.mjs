import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture, credentials } from "./helpers.mjs";
import worker, { totp } from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");
test("F3 browser login, enrollment, CMS publishing, public site and mobile", async (t) => {
  const f = await fixture(t);
  const initialContent = JSON.parse(f.db.prepare('SELECT body FROM content WHERE id=1').get().body);
  initialContent.projects = [{ id: 'theme-project', title: 'Theme test project', sector: 'residential', location: 'Quezon City', capacity: '6 kWp', description: 'An illustrative project used for browser theme checks.', image: 'assets/solar.jpg', gallery: [{ src: 'assets/solar.jpg', caption: 'Illustrative solar photo' }], status: 'published', sample: true }];
  f.db.prepare('UPDATE content SET body=? WHERE id=1').run(JSON.stringify(initialContent));
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  t.after(() => browser.close());
  const context = await browser.newContext();
  const errors = [];
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  let rejectNextContentSave = false;
  await context.route("**/*", async (route) => {
    const req = route.request();
    if (!req.url().startsWith(f.env.APP_ORIGIN)) {
      await route.abort();
      return;
    }
    if (rejectNextContentSave && req.url().endsWith('/api/admin/content') && req.method() === 'PUT') {
      rejectNextContentSave = false;
      await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Test conflict: retry your save.' }) });
      return;
    }
    const response = await worker.fetch(
      new Request(req.url(), {
        method: req.method(),
        headers: await req.allHeaders(),
        ...(req.postDataBuffer() ? { body: req.postDataBuffer() } : {}),
      }),
      f.env,
    );
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
  await page.goto(f.env.APP_ORIGIN + "/admin");
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:'/tmp/techouse-login-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'/tmp/techouse-login-mobile.png'});
  await page.setViewportSize({width:1440,height:900});
  await page.locator('.auth-password-toggle').click();
  assert.equal(await page.locator('#login-password').getAttribute('type'),'text');
  await page.locator('.auth-password-toggle').click();
  await page.locator("[name=email]").fill(credentials.email);
  await page.locator("#login [name=password]").fill(credentials.password);
  await page.locator("#login button[type=submit]").click();
  await page.locator("#mfa-qr").waitFor({ state: "visible" });
  assert(
    await page.locator("#mfa-qr").evaluate(
      (canvas) =>
        canvas.width > 200 &&
        canvas
          .getContext("2d")
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.some((v, i) => i % 4 === 0 && v === 0),
    ),
  );
  assert(await page.locator('#use-recovery').isHidden());
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'/tmp/techouse-authenticator-desktop.png'});
  const secret = await page.locator("#secret").textContent();
  await page
    .locator("#mfa [name=code]")
    .fill(await totp(secret, Math.floor(Date.now() / 30000)));
  await page
    .locator("#mfa button[type=submit], #mfa button:not([type])")
    .click();
  await page.locator("#recovery").waitFor({ state: "visible" });
  await page.locator("#saved-codes").click();
  await page.waitForURL("**/office.html#/office");
  await page.waitForSelector('.office-header-title');
  assert.equal(await page.locator('#header [data-secure-signout]').count(),1);
  assert.equal(await page.locator('.admin-disclosure [data-secure-signout]').count(),0);
  await page.waitForSelector('.office-dashboard');
  await page.locator('[data-theme-choice="dark"]').click();
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(24, 34, 31)');
  await page.reload(); await page.waitForSelector('.office-dashboard');
  assert.equal(await page.locator('[data-theme-choice="dark"]').getAttribute('aria-pressed'),'true');
  await page.goto(f.env.APP_ORIGIN+'/office.html#/office/new');
  await page.waitForSelector('.editor-aside');
  assert.equal(await page.locator('.editor-aside').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(38, 57, 47)');
  assert.equal(await page.locator('#header .brand-logo').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
  await page.goto(f.env.APP_ORIGIN+'/office.html#/office/posts');
  await page.waitForSelector('.table-heading');
  assert.equal(await page.locator('.table-heading').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(38, 57, 47)');
  await page.goto(f.env.APP_ORIGIN+'/office.html#/office');
  await page.waitForSelector('.office-dashboard');
  await page.locator('[data-theme-choice="grey"]').click();
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(222, 223, 223)');
  await page.locator('[data-theme-choice="light"]').click();
  assert.equal(await page.locator('.office-helper, .helper-tour').count(), 0);
  await page.evaluate(()=>localStorage.setItem('techouse.sample.inquiries.v1',JSON.stringify([{id:'TEST-INQ-1',name:'Test customer',email:'test@example.test',location:'Quezon City',division:'solar',requirements:'Test property inquiry',createdAt:new Date().toISOString()},{id:'TEST-INQ-2',name:'Reviewed customer',email:'reviewed@example.test',location:'Makati',division:'solar',requirements:'Test reviewed inquiry',createdAt:new Date().toISOString(),reviewedAt:new Date().toISOString()}])));
  await page.reload(); await page.waitForSelector('.office-stats-four');
  await page.locator('[data-theme-choice="dark"]').click();
  assert.equal(await page.locator('.office-recent-inquiries .inquiry-card').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(34, 49, 42)');
  assert.equal(await page.locator('.inquiry-card [data-view-inquiry]').first().evaluate(el=>getComputedStyle(el).color), 'rgb(210, 229, 211)');
  await page.goto(f.env.APP_ORIGIN + '/office.html#/office/inquiries');
  await page.waitForSelector('.inquiry-list .inquiry-card');
  assert.equal(await page.locator('.inquiry-list .inquiry-card').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(34, 49, 42)');
  await page.locator('[data-theme-choice="light"]').click();
  await page.goto(f.env.APP_ORIGIN + '/office.html#/office');
  await page.waitForSelector('.office-stats-four');
  assert.equal(await page.locator('.office-stats-four > a strong').nth(0).textContent(),'2');
  assert.equal(await page.locator('.office-stats-four > a strong').nth(1).textContent(),'1');
  assert.equal(await page.locator('.office-three-tasks > article').count(),3);
  await page.locator('[data-view-inquiry="TEST-INQ-1"]').click();
  await page.waitForSelector('#modal[open]');
  await page.locator('#modal [data-close-modal]').click();
  assert.equal(await page.locator('.office-stats-four > a strong').nth(1).textContent(),'0');

  await page.setViewportSize({width:2560,height:1440});
  await page.goto(f.env.APP_ORIGIN+'/office.html#/office/posts');
  await page.waitForSelector('.post-table');
  assert(await page.evaluate(()=>Math.abs(document.querySelector('#footer').getBoundingClientRect().bottom-innerHeight)<2));

  assert.equal(await page.locator('#header .office-header-title').textContent(),'Back office');
  assert.equal(await page.locator('#header .nav-actions, #header .nav-links, #header .reading-size').count(),0);
  assert.equal(await page.locator('#footer .footer-top').count(),0);
  assert((await page.locator('#footer').textContent()).includes('Website content management'));

  await page.goto(f.env.APP_ORIGIN+'/office.html#/office/projects');
  await page.waitForSelector('#project-editor');
  await page.locator('[data-theme-choice="dark"]').click();
  assert.equal(await page.locator('.project-mode-header').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(41, 61, 49)');
  assert.equal(await page.locator('.project-manager-browser').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(24, 34, 31)');
  assert.equal(await page.locator('#project-editor .content-field').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  assert.equal(await page.locator('.managed-project-row').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(32, 54, 43)');
  assert.equal(await page.locator('.managed-project-actions [data-edit-project]').first().evaluate(el=>getComputedStyle(el).color), 'rgb(217, 234, 220)');
  assert.equal(await page.locator('.office-sector-tabs [aria-pressed="true"]').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(51, 94, 69)');
  const inactiveStatus = page.locator('.office-status-tabs button[aria-pressed="false"]').first();
  const statusColors = await inactiveStatus.evaluate(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  await inactiveStatus.hover();
  assert.deepEqual(await inactiveStatus.evaluate(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]), statusColors);
  await page.locator('#header .office-signout').hover();
  assert.equal(await page.locator('#header .office-signout').evaluate(el => getComputedStyle(el).color), 'rgb(24, 34, 31)');
  await page.screenshot({path:'/tmp/unified-project-library-dark.png'});
  assert.equal(await page.locator('.project-photo-manager').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(41, 61, 49)');
  await page.locator('[data-theme-choice="light"]').click();
  await page.locator('#project-editor input[name="title"]').fill('Unsaved project regression');
  page.once('dialog', dialog=>dialog.dismiss());
  await page.locator('.project-browser-heading [data-new-project]').click();
  assert.equal(await page.locator('#project-editor input[name="title"]').inputValue(),'Unsaved project regression');
  page.once('dialog', dialog=>dialog.accept());
  await page.locator('.project-browser-heading [data-new-project]').click();
  assert.equal(await page.locator('#project-editor input[name="title"]').inputValue(),'');
  await page.locator('[data-edit-project="theme-project"]').click();
  const projectDetails = { system: 'Grid-tied solar', projectCost: '₱240,000', roi: '5.5 years simple payback', annualMaintenance: '₱3,000 / year', roofType: 'Long-span metal roofing', engineeringChallenges: 'Designed mounting around existing roof penetrations.', clientFeedback: 'Clear communication throughout the project.' };
  for (const [name,value] of Object.entries(projectDetails)) await page.locator(`#project-editor [name="${name}"]`).fill(value);
  const projectSave = page.waitForResponse(response => response.url().includes('/api/admin/content') && response.request().method()==='PUT');
  await page.locator('#project-editor button[type="submit"]').click();
  assert.equal((await projectSave).status(),200);
  await page.waitForFunction(() => document.querySelector('#project-editor input[name="projectId"]')?.value === '');
  await page.locator('[data-edit-project="theme-project"]').click();
  for (const [name,value] of Object.entries(projectDetails)) assert.equal(await page.locator(`#project-editor [name="${name}"]`).inputValue(),value);
  const storedProject = JSON.parse(f.db.prepare('SELECT body FROM content WHERE id=1').get().body).projects.find(project => project.id==='theme-project');
  for (const [name,value] of Object.entries(projectDetails)) assert.equal(storedProject[name],value);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar/projects/theme-project');
  await page.waitForSelector('#project-detail-dialog[open]');
  const portfolioText = await page.locator('#project-detail-dialog').textContent();
  for (const value of Object.values(projectDetails)) assert(portfolioText.includes(value));
  await page.getByRole('button',{name:'Close project details'}).click();
  await page.goto(f.env.APP_ORIGIN + "/office.html#/office/customizer");
  await page.waitForSelector("#website-customizer");
  await page.locator('[data-theme-choice="dark"]').click();
  assert.equal(await page.locator('.banner-preview-panel').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(34, 49, 42)');
  assert.equal(await page.locator('.preview-toolbar').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(34, 49, 42)');
  assert.equal(await page.locator('.preview-help').evaluate(el=>getComputedStyle(el).color), 'rgb(186, 201, 189)');
  assert.equal(await page.locator('.banner-image-selector button').last().evaluate(el=>getComputedStyle(el).color), 'rgb(231, 238, 232)');
  await page.locator('[data-theme-choice="light"]').click();
  assert.equal(await page.locator('textarea[name*="intro-step"],textarea[name*="banner-hook"],textarea[name*="banner-description"]').count(), 0);
  assert.equal(await page.locator('textarea').evaluateAll(nodes => nodes.filter(node => node.name.includes('.banner-division-label')).length), 5);
  await page.locator('[data-customizer-section="banners"]').click();
  await page.locator('textarea[name$=".banner-division-label"]').first().fill('Solar energy preview label');
  await page.waitForFunction(() => document.querySelector('.banner-preview-viewport iframe')?.contentDocument?.querySelector('[data-banner="solar"] .banner-division-label')?.textContent === 'Solar energy preview label');
  await page.locator('[data-customizer-section="opening"]').click();
  await page
    .locator('textarea[name="#landing-title"]')
    .fill("A shared title from the secure CMS");
  await page.waitForFunction(()=>document.querySelector('.banner-preview-viewport iframe')?.contentDocument?.querySelector('#landing-title')?.textContent==='A shared title from the secure CMS');
  await page.evaluate(()=>document.querySelector('.banner-preview-viewport iframe').contentDocument.querySelector('#landing-title').dataset.previewTest='stable');
  await page.evaluate(()=>{
    const input=document.querySelector('[data-banner-upload="solar"]');
    input.closest('.content-field').querySelector('img').setAttribute('src','assets/construction.jpg');
    document.querySelector('#website-customizer textarea').dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
    const photos=[...document.querySelector('.banner-preview-viewport iframe').contentDocument.querySelectorAll('[data-banner="solar"] .banner-background > img')];
    return photos.length===2 && photos.every(img=>img.getAttribute('src')==='assets/construction.jpg');
  });
  await page.evaluate(()=>{
    const input=document.querySelector('[data-banner-upload="solar"]');
    input.closest('.content-field').querySelector('img').setAttribute('src','assets/solar.jpg');
    document.querySelector('#website-customizer textarea').dispatchEvent(new Event('input',{bubbles:true}));
  });

  await page.locator('textarea[name="#landing-title"]').fill('Latest unsaved preview text');
  await page.waitForFunction(()=>document.querySelector('.banner-preview-viewport iframe').contentDocument.querySelector('#landing-title').textContent==='Latest unsaved preview text');
  assert.equal(await page.evaluate(()=>document.querySelector('.banner-preview-viewport iframe').contentDocument.querySelector('#landing-title').dataset.previewTest),'stable');
  await page.locator('textarea[name="#landing-title"]').fill('A shared title from the secure CMS');
  await page.waitForFunction(()=>document.querySelector('.banner-preview-viewport iframe').contentDocument.querySelector('#landing-title').textContent==='A shared title from the secure CMS');
  await page.locator('button[type="submit"]:not([value])').click();
  await page.waitForFunction(() =>
    document
      .querySelector("#content-status")
      .textContent.includes("saved online"),
  );
  // Review actions wait for the server; a rejected save keeps the draft and dialog open.
  await page.locator('textarea[name=".landing-kicker"]').fill('Saved through the changes review');
  await page.locator('.admin-tabs a[href="#/office/projects"]').click();
  await page.waitForSelector('#draft-review-dialog[open]');
  rejectNextContentSave = true;
  page.once('dialog', dialog => dialog.accept());
  const rejected = page.waitForResponse(response => response.url().endsWith('/api/admin/content') && response.request().method() === 'PUT');
  await page.locator('[data-save-leave]').click();
  assert.equal((await rejected).status(), 409);
  await page.waitForFunction(() => !document.querySelector('[data-save-leave]').disabled);
  assert.equal(await page.locator('#draft-review-dialog[open]').count(), 1);
  assert.ok(page.url().endsWith('#/office/customizer'));
  await page.locator('[data-save-leave]').click();
  await page.waitForURL('**/office.html#/office/projects');
  await page.waitForSelector('#project-editor');
  assert.equal(JSON.parse(f.db.prepare('SELECT body FROM content WHERE id=1').get().body).text['.landing-kicker'], 'Saved through the changes review');
  assert.equal(JSON.parse(f.db.prepare('SELECT body FROM content WHERE id=1').get().body).text['[data-banner="solar"] .banner-division-label'], 'Solar energy preview label');
  await page.goto(f.env.APP_ORIGIN + "/");
  await page.waitForSelector("#landing-title");
  assert.equal(
    await page.locator("#landing-title").textContent(),
    "A shared title from the secure CMS",
  );
  if(await page.locator('.skip-intro').isVisible()) await page.locator('.skip-intro').click();
  await page.waitForFunction(()=>!document.querySelector('.division-landing')?.classList.contains('intro-playing'));
  const panel=await page.locator('.division-banner').nth(1).boundingBox();
  await page.mouse.move(panel.x+panel.width/2,panel.y+panel.height*.8);
  await page.mouse.move(panel.x+panel.width/2+12,panel.y+panel.height*.8);
  await page.waitForFunction(()=>document.querySelectorAll('.division-banner.is-open').length===1);
  const selected=await page.locator('.division-banner.is-open').getAttribute('data-banner');
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.division-banner.is-open').getAttribute('data-banner'),selected);
  await page.evaluate(()=>{location.hash='/about';});
  await page.waitForSelector('.content-columns');
  await page.evaluate(()=>{location.hash='/';});
  await page.waitForSelector('.previous-page-snapshot');
  await page.evaluate(()=>{location.hash='/office';});
  await page.waitForURL('**/office.html#/office');
  await page.waitForSelector('.admin-tabs');
  assert.equal(await page.locator('.previous-page-snapshot').count(),0);
  for (const route of [
    "/about",
    "/divisions",
    "/divisions/solar",
    "/divisions/construction",
    "/divisions/prefabrication",
    "/divisions/development",
    "/divisions/elevators",
    "/updates",
    "/inquiry?division=solar",
  ]) {
    await page.goto(f.env.APP_ORIGIN + "/#" + route);
    await page.waitForSelector("#main h1");
  }
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar');
  await page.waitForSelector('#solar-estimator');
  await page.locator('#solar-estimator .calculate-cost').click();
  await page.waitForSelector('.estimate-economics');
  assert.equal(await page.locator('.estimate-economics dd').nth(0).textContent(),'₱4,800');
  assert.equal(await page.locator('.estimate-economics dd').nth(1).textContent(),'3.1–4.2 years');
  assert.equal(await page.locator('.estimate-economics dd').nth(2).textContent(),'₱2,025 / year');
  assert(!(await page.locator('#estimate-result').textContent()).includes('NaN'));
  assert(await page.locator('.calculate-cost').isHidden());
  await page.locator('#solar-estimator input[name="bill"]').fill('7000');
  assert(await page.locator('.calculate-cost').isVisible());
  assert.equal(await page.locator('.estimate-economics').count(),0);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar');
  await page.waitForSelector('#solar-estimator');
  await page.locator('#solar-estimator input[name="bill"]').fill('6000');
  await page.locator('#solar-estimator input[name="offset"]').evaluate(input => {
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#solar-estimator .calculate-cost').click();
  assert.equal(await page.locator('.estimate-economics dd').first().textContent(), '₱1,200');
  await page.locator('#solar-estimate-inquiry').click();
  await page.locator('#repeat-inquiry-dialog [data-existing-action="view"]').click();
  await page.waitForSelector('#saved-inquiry-history');
  await page.locator('#saved-inquiry-history > a').click();
  await page.locator('#repeat-inquiry-dialog [data-existing-action="continue"]').click();
  await page.waitForSelector('#inquiry-form');
  assert.equal(await page.locator('#inquiry-form').getAttribute('data-solar-savings'), '1200');
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar/projects/%');
  await page.waitForSelector('#project-detail-dialog[open]');
  assert.match(await page.locator('#project-detail-dialog').textContent(), /Project unavailable/);
  await page.getByRole('button', { name: 'Close project details' }).click();
  await page.goto(f.env.APP_ORIGIN + "/#/office");
  await page.waitForURL("**/office.html#/office");
  await page.waitForSelector(".admin-tabs");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/techouse-restored-office-mobile.png",
    fullPage: true,
  });

  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
  );
  for (const width of [390, 1299]) {
    await page.setViewportSize({width,height:844});
    for (const theme of ['light','dark','grey']) {
      for (const section of ['office','office/posts','office/new','office/projects','office/customizer','office/inquiries']) {
        await page.goto(f.env.APP_ORIGIN+'/office.html#/'+section);
        await page.waitForSelector('.admin-shell');
        await page.locator('[data-theme-choice="'+theme+'"]').click();
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), 'Overflow: '+section+' '+theme+' '+width);
      }
    }
  }
  await page.goto(f.env.APP_ORIGIN+'/admin#security');
  await page.waitForSelector('#account-security');
  await page.setViewportSize({width:1440,height:1100});
  assert.equal(await page.locator('.account-security-grid > .security-panel').count(),2);
  assert.equal(await page.locator('#change-password input').count(),4);
  await page.screenshot({path:'/tmp/techouse-account-security-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'/tmp/techouse-account-security-mobile.png',fullPage:true});
  assert.deepEqual(errors, []);
  await page.screenshot({
    path: "/tmp/techouse-secure-cms-mobile.png",
    fullPage: true,
  });
});
