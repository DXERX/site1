// قاعدة بيانات المحتوى الموسعة
const contentDatabase = {
    fact: [
        {
            content: "العسل هو الطعام الوحيد الذي لا يفسد أبداً. تم العثور على عسل صالح للأكل في مقابر مصرية عمرها 3000 عام.",
            source: "National Geographic"
        },
        {
            content: "قلب الإنسان يضخ حوالي 7570 لتر من الدم يومياً.",
            source: "جمعية القلب الأمريكية"
        }
    ],
    quote: [
        {
            content: "“النجاح هو مجموع الجهود الصغيرة التي تتكرر يومياً.”",
            author: "روبرت كولير"
        },
        {
            content: "“ليس المهم ما يحدث لك، ولكن المهم كيف ترد على ما يحدث لك.”",
            author: "أبيكتيتوس"
        }
    ],
    challenge: [
        {
            content: "اكتب جملة من 5 كلمات تصف فيها السماء!",
            difficulty: "سهل"
        },
        {
            content: "قم بعمل 10 تمارين ضغط الآن!",
            difficulty: "متوسط"
        }
    ]
};

// عناصر DOM
const elements = {
    contentDisplay: document.getElementById('content'),
    generateBtn: document.getElementById('generateBtn'),
    shareBtn: document.getElementById('shareBtn'),
    saveBtn: document.getElementById('saveBtn'),
    shareActions: document.getElementById('shareActions'),
    contentType: document.getElementById('contentType'),
    contentDate: document.getElementById('contentDate'),
    contentCard: document.querySelector('.content-card'),
    typeButtons: document.querySelectorAll('.type-btn'),
    themeToggle: document.querySelector('.theme-toggle'),
    loader: document.querySelector('.loader')
};

// حالة التطبيق
let appState = {
    currentContent: null,
    selectedType: 'all',
    savedItems: JSON.parse(localStorage.getItem('savedItems')) || [],
    darkMode: localStorage.getItem('darkMode') === 'true'
};

// تهيئة التطبيق
function initApp() {
    // تعيين وضع الثيم
    if (appState.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // تعيين التاريخ
    elements.contentDate.textContent = new Date().toLocaleDateString('ar-EG');
    
    // إضافة Event Listeners
    elements.generateBtn.addEventListener('click', generateContent);
    elements.shareBtn.addEventListener('click', shareContent);
    elements.saveBtn.addEventListener('click', saveContent);
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    elements.typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.selectedType = btn.dataset.type;
        });
    });
    
    // تحميل المحتوى المحفوظ
    if (appState.savedItems.length > 0) {
        elements.saveBtn.textContent = `محفوظ (${appState.savedItems.length})`;
    }
}

// توليد محتوى عشوائي
function generateContent() {
    elements.loader.classList.remove('hidden');
    elements.contentDisplay.classList.add('hidden');
    elements.shareActions.classList.add('hidden');
    
    // محاكاة التحميل
    setTimeout(() => {
        let contentPool = [];
        
        if (appState.selectedType === 'all') {
            contentPool = [
                ...contentDatabase.fact.map(item => ({ ...item, type: 'fact' })),
                ...contentDatabase.quote.map(item => ({ ...item, type: 'quote' })),
                ...contentDatabase.challenge.map(item => ({ ...item, type: 'challenge' }))
            ];
        } else {
            contentPool = contentDatabase[appState.selectedType].map(item => ({ 
                ...item, 
                type: appState.selectedType 
            }));
        }
        
        const randomIndex = Math.floor(Math.random() * contentPool.length);
        appState.currentContent = contentPool[randomIndex];
        
        displayContent(appState.currentContent);
        
        elements.loader.classList.add('hidden');
        elements.contentDisplay.classList.remove('hidden');
        elements.shareActions.classList.remove('hidden');
        
        // تأثيرات مرئية
        elements.contentCard.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            elements.contentCard.classList.remove('animate__animated', 'animate__fadeIn');
        }, 1000);
        
        // تأثير كونفيتي للمحتوى المميز
        if (Math.random() > 0.8) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, 800);
}

// عرض المحتوى
function displayContent(content) {
    elements.contentCard.className = 'content-card ' + content.type;
    
    let html = '';
    switch(content.type) {
        case 'fact':
            html = `
                <h3>معلومة غريبة</h3>
                <p>${content.content}</p>
                <p class="source">المصدر: ${content.source}</p>
            `;
            elements.contentType.textContent = 'معلومة';
            break;
        case 'quote':
            html = `
                <h3>اقتباس اليوم</h3>
                <blockquote>${content.content}</blockquote>
                <p class="author">— ${content.author}</p>
            `;
            elements.contentType.textContent = 'اقتباس';
            break;
        case 'challenge':
            html = `
                <h3>تحدي اليوم</h3>
                <p>${content.content}</p>
                <p class="difficulty">الصعوبة: ${content.difficulty}</p>
            `;
            elements.contentType.textContent = 'تحدي';
            break;
    }
    
    elements.contentDisplay.innerHTML = html;
    elements.contentDate.textContent = new Date().toLocaleDateString('ar-EG');
}

// مشاركة المحتوى
function shareContent() {
    if (navigator.share) {
        navigator.share({
            title: `جرعتي اليومية - ${elements.contentType.textContent}`,
            text: elements.contentDisplay.textContent,
            url: window.location.href
        }).catch(err => {
            console.error('Error sharing:', err);
        });
    } else {
        // Fallback for desktop
        const textToCopy = `${elements.contentDisplay.textContent}\n\nجرعتك اليومية من ${window.location.href}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('تم نسخ المحتوى إلى الحافظة! يمكنك مشاركته الآن.');
        });
    }
}

// حفظ المحتوى
function saveContent() {
    if (!appState.currentContent) return;
    
    const isAlreadySaved = appState.savedItems.some(
        item => item.content === appState.currentContent.content
    );
    
    if (!isAlreadySaved) {
        appState.savedItems.push({
            ...appState.currentContent,
            savedAt: new Date().toISOString()
        });
        
        localStorage.setItem('savedItems', JSON.stringify(appState.savedItems));
        elements.saveBtn.textContent = `محفوظ (${appState.savedItems.length})`;
        
        // تأثير مرئي
        elements.saveBtn.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            elements.saveBtn.classList.remove('animate__animated', 'animate__pulse');
        }, 1000);
    }
}

// تبديل وضع الثيم
function toggleTheme() {
    appState.darkMode = !appState.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', appState.darkMode);
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initApp);