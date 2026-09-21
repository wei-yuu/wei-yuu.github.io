<script setup lang="ts">
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding/bullet-engine`)
const description = '忠實移植 wei-yuu/wedding 的彈匣循環填補模式,Demo-only 即時彈幕牆。'

useSeoMeta({
  title: '賓客祝福彈幕 ｜ 互動婚禮網站 Case Study',
  description,
  ogTitle: '賓客祝福彈幕',
  ogDescription: description,
  ogUrl: pageUrl,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})
</script>

<template>
  <div>
    <ContextualHeader />
    <main>
      <PageContainer class="py-10 lg:py-14">
        <AppBreadcrumb
          :items="[
            { label: '作品集', to: '/projects' },
            { label: '互動婚禮網站', to: '/projects/wedding' },
            { label: '賓客祝福彈幕' },
          ]"
        />

        <!-- Website 設計文件 §4.6:內容順序為麵包屑 → 模組目的與真實來源 →
             Demo → 使用說明與限制 → 技術說明 → 返回案例。這個亮點頁沒有對應
             的 Figma 提案畫面,樣式沿用作品集頁已對過 Figma 的字級/色票。 -->
        <h1 class="mt-6 font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">賓客祝福彈幕</h1>
        <p class="mt-2 max-w-[720px] text-body text-wy-text-secondary">
          忠實移植自 wei-yuu/wedding 真實上線版本的彈匣循環填補(Magazine Pattern):固定軌道數量,
          每軌一次僅播一則,播畢即從佇列依序抽下一則補位,序列化天生無碰撞,不需碰撞演算法。
        </p>

        <section class="mt-10">
          <BulletPlayground />
        </section>

        <section class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">使用說明與限制</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">USAGE</p>
          </div>
          <ul class="mt-4 max-w-[720px] list-disc space-y-1.5 pl-5 text-body text-wy-text-secondary">
            <li>單則祝福限制 30 字,送出後有 1.5 秒節流,避免連續送出造成畫面暴增。</li>
            <li>純前端記憶體模擬,不寫入任何後端;重新整理頁面即清空,僅此頁暫存。</li>
            <li>空白或未輸入內容不會送出,不會出現在彈幕牆上。</li>
          </ul>
        </section>

        <section class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">技術說明</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">HOW IT WORKS</p>
          </div>
          <p class="mt-4 max-w-[720px] text-body text-wy-text-secondary">
            每條軌道是一個固定格子,彈幕播完動畫就從彈匣佇列依序抽下一則補進同一格——同一時刻同一軌道
            永遠只有一則在跑,天生不會互相重疊,不需要額外的碰撞偵測演算法。移動距離依「軌道寬度 + 文字
            實際寬度」量測計算,不管文字長短都能剛好跑滿整條軌道。
          </p>
        </section>

        <AppButton to="/projects/wedding" variant="secondary" class="mt-10">
          ← 回互動婚禮網站 Case Study
        </AppButton>
      </PageContainer>
    </main>

    <footer class="no-print border-t border-wy-border-subtle py-8">
      <PageContainer class="flex items-center justify-between">
        <p class="font-display-en text-2xl text-wy-text">Wei Yu</p>
        <p class="text-xs text-wy-text-muted">Wilson &amp; Yura</p>
      </PageContainer>
    </footer>
  </div>
</template>
