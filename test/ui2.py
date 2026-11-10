import time
from playwright.sync_api import sync_playwright
SP=['soccer','basketball','volleyball','teeball','ultimate','flag','handball','netball','futsal','dodgeball']
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(reduced_motion='reduce', viewport={'width':1440,'height':950})
    errs=[]; pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e))); pg.on('console',lambda m: m.type=='error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text and errs.append(m.text))
    pg.goto('file:///home/claude/gc/test/index.html#skipintro'); time.sleep(1)
    pg.screenshot(path='test/shots/home.png', full_page=True)
    for s in SP:
        pg.click(f'.tile[data-sport="{s}"]'); time.sleep(.3)
        if s in ('netball','soccer','teeball','ultimate','dodgeball'): pg.screenshot(path=f'test/shots/{s}_edit.png')
        pg.click('#playBtn'); time.sleep(1.5); pg.click('#playBtn')
        pg.click('.tab[data-view="book"]'); time.sleep(.2); pg.click('.tab[data-view="make"]')
        pg.click('#homeBtn'); time.sleep(.2)
    pg.click('#themeBtn'); time.sleep(.2); pg.screenshot(path='test/shots/home_dark.png')
    print('errors', errs)
    m=b.new_page(reduced_motion='reduce', viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    m.goto('file:///home/claude/gc/test/index.html#skipintro'); time.sleep(.8)
    print('mobile overflow', m.evaluate("[document.documentElement.scrollWidth, innerWidth]"))
    m.screenshot(path='test/shots/m_home.png')
    m.click('.tile[data-sport="netball"]'); time.sleep(.3); m.screenshot(path='test/shots/m_ws.png')
    print('mobile overflow2', m.evaluate("[document.documentElement.scrollWidth, innerWidth]"))
    b.close()
