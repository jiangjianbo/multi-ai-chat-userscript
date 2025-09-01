
/**
 * 多语言支持文本常量
 * @type {Object}
 */
function I18n() {
    const LANGS = {
        en: {
            syncCompare: "Sync Compare",
            multipleAiChat: "Multiple AI Sync Chat",
            layout: "Layout",
            settings: "Settings",
            newChat: "New Chat",
            confirmSwitch: "Are you sure you want to switch AI? Current content will be replaced.",
            close: "Close",
            share: "Share",
            openInWindow: "Open in Window",
            webSearch: "Web Search",
            send: "Send"
        },
        zh: {
            syncCompare: "同步对比",
            multipleAiChat: "多个AI同步聊天",
            layout: "布局",
            settings: "设置",
            newChat: "新对话",
            confirmSwitch: "确定要切换AI吗？当前内容将被替换。",
            close: "关闭",
            share: "分享",
            openInWindow: "在窗口中打开",
            webSearch: "网页搜索",
            send: "发送"
        },
        fr: {
            syncCompare: "Comparaison synchrone",
            multipleAiChat: "Chat synchrone avec plusieurs IA",
            layout: "Disposition",
            settings: "Paramètres",
            newChat: "Nouvelle conversation",
            confirmSwitch: "Voulez-vous vraiment changer d'IA ? Le contenu actuel sera remplacé.",
            close: "Fermer",
            share: "Partager",
            openInWindow: "Ouvrir dans une fenêtre",
            webSearch: "Recherche web",
            send: "Envoyer"
        },
        ja: {
            syncCompare: "同期比較",
            multipleAiChat: "複数AI同期チャット",
            layout: "レイアウト",
            settings: "設定",
            newChat: "新しい会話",
            confirmSwitch: "AIを切り替えてもよろしいですか？現在のコンテンツは置き換えられます。",
            close: "閉じる",
            share: "共有",
            openInWindow: "ウィンドウで開く",
            webSearch: "Web検索",
            send: "送信"
        },
        ko: {
            syncCompare: "동기화 비교",
            multipleAiChat: "다중 AI 동기 채팅",
            layout: "레이아웃",
            settings: "설정",
            newChat: "새 대화",
            confirmSwitch: "AI를 전환하시겠습니까? 현재 내용이 교체됩니다.",
            close: "닫기",
            share: "공유",
            openInWindow: "새 창에서 열기",
            webSearch: "웹 검색",
            send: "보내기"
        },
        es: {
            syncCompare: "Comparación sincrónica",
            multipleAiChat: "Chat sincrónico con múltiples IA",
            layout: "Diseño",
            settings: "Configuración",
            newChat: "Nuevo chat",
            confirmSwitch: "¿Estás seguro de cambiar de IA? El contenido actual será reemplazado.",
            close: "Cerrar",
            share: "Compartir",
            openInWindow: "Abrir en ventana",
            webSearch: "Búsqueda web",
            send: "Enviar"
        },
        pt: {
            syncCompare: "Comparação síncrona",
            multipleAiChat: "Chat síncrono com múltiplas IAs",
            layout: "Layout",
            settings: "Configurações",
            newChat: "Nova conversa",
            confirmSwitch: "Tem certeza que deseja mudar de IA? O conteúdo atual será substituído.",
            close: "Fechar",
            share: "Compartilhar",
            openInWindow: "Abrir em janela",
            webSearch: "Pesquisa web",
            send: "Enviar"
        },
        ar: {
            syncCompare: "النسبة المُتزامنة",
            multipleAiChat: "الدردشة المتزامنة مع عدة أنظمة ذكية",
            layout: "التخطيط",
            settings: "الإعدادات",
            newChat: "دردشة جديدة",
            confirmSwitch: "هل أنت متأكد من رغبتك في تبديل الأنظمة الذكية؟ سيتم استبدال المحتوى الحالي.",
            close: "إغلاق",
            share: "مشاركة",
            openInWindow: "فتح في نافذة جديدة",
            webSearch: "البحث عبر الويب",
            send: "إرسال"
        }
    };

    this.getLang = function (lang) {
        return LANGS[lang];
    };
}

export default I18n;