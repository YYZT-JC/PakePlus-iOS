window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// ================= 新增：输入框自动唤起与防遮挡 =================
const hookInput = (e) => {
    const el = e.target
    if (!el) return

    const tag = el.tagName
    const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        el.isContentEditable

    if (!isEditable) return

    console.log('input focus', el)

    // 1. 确保聚焦，唤起输入法
    // 用 setTimeout 避免与浏览器默认行为冲突
    setTimeout(() => {
        el.focus({ preventScroll: true })
    }, 0)

    // 2. 防止键盘遮挡输入框
    const ensureVisible = () => {
        const rect = el.getBoundingClientRect()
        const vv = window.visualViewport

        // 可视区域高度与顶部偏移
        const viewportHeight = vv ? vv.height : window.innerHeight
        const viewportTop = vv ? vv.offsetTop : 0
        const safeBottom = viewportTop + viewportHeight

        // 留一点边距，避免贴边
        const margin = 24

        if (rect.bottom > safeBottom - margin) {
            const scrollDelta = rect.bottom - safeBottom + margin
            console.log('scroll to visible, delta =', scrollDelta)
            window.scrollBy({
                top: scrollDelta,
                behavior: 'smooth'
            })
            // 也可以使用 el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
    }

    // 键盘弹出需要时间，延迟检查
    setTimeout(ensureVisible, 300)

    // 3. 监听可视区域变化（键盘弹出会触发 visualViewport 的 resize）
    if (window.visualViewport) {
        const onResize = () => {
            ensureVisible()
            window.visualViewport.removeEventListener('resize', onResize)
        }
        window.visualViewport.addEventListener('resize', onResize, { once: true })
    } else {
        // 降级方案：监听 window.resize
        const onResize = () => {
            ensureVisible()
            window.removeEventListener('resize', onResize)
        }
        window.addEventListener('resize', onResize, { once: true })
    }
}

// 使用 focusin 捕获阶段，确保输入框获得焦点时立即处理
document.addEventListener('focusin', hookInput, { capture: true })
// ================= 新增结束 =================