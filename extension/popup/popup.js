document.addEventListener('DOMContentLoaded', function () {
  const hadithElement = document.getElementById('hadith');
  const explanationElement = document.getElementById('explanation');
  const summaryElement = document.getElementById('summary-title');
  // Fetch Hadith on page load
  chrome.storage.local.get(
    { preferredHadithLang: 'ar', preferredHadithFetchMode: 'daily', preferredTheme: 'auto' },
    (item) => {
      const applyDarkMode = item.preferredTheme === 'dark'
          || (item.preferredTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      applyTheme(applyDarkMode);
      if (item.preferredHadithLang === 'en' || item.preferredHadithLang === 'english') {
        hadithElement.style.direction = 'ltr';
        explanationElement.style.direction = 'ltr';
        summaryElement.style.direction = 'ltr';
        summaryElement.textContent = 'Explanation';
      } else {
        hadithElement.style.direction = 'rtl';
        explanationElement.style.direction = 'rtl';
        summaryElement.style.direction = 'rtl';
        summaryElement.textContent = 'تفسير الحديث';
      }
      fetchHadith(
        hadithElement,
        explanationElement,
        item.preferredHadithLang,
        item.preferredHadithFetchMode
      );
    }
  );
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => applyTheme(e.matches));

function applyTheme(darkMode) {
    if (darkMode) {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
}

document.querySelector('#go-to-options').addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

function fetchHadith(
  hadithElement,
  explanationElement,
  hadithLang,
  hadithFetchMode
) {
  fetch(
    'https://dailyislamichadith.com/api/fetch-hadith?fetch-mode=' +
      hadithFetchMode +
      '&lang=' +
      hadithLang
  )
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('explanation-container').style.display = 'block';
      if (hadithLang === 'en' || hadithLang === 'english') {
        hadithElement.textContent = data.hadithEnglish;
        explanationElement.textContent = data.hadithExplanationEnglish;
      } else {
        hadithElement.textContent = data.hadithArabic;
        explanationElement.textContent = data.hadithExplanationArabic;
      }
    })
    .catch((error) => {
      if (hadithLang === 'en' || hadithLang === 'english') {
        hadithElement.textContent = 'Failed to load Hadith.';
        explanationElement.textContent = 'Failed to load explanation.';
      } else {
        hadithElement.textContent =
          'حدث خطأ ما. يرجى المحاولة مرة أخرى في وقت لاحق.';
        explanationElement.textContent =
          'حدث خطأ ما. يرجى المحاولة مرة أخرى في وقت لاحق.';
      }
      console.error('Error fetching Hadith:', error);
    });
}
