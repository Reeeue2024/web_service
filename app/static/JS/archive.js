let allPosts = []; // 전체 글 목록
let filterResultPosts = []; // 필터링 적용한 글 목록

let currentPageNumber = 1; // 현재 페이지 번호
let currentPageGroup = 1; // 현재 페이지 그룹 번호

const postsPerPage = 20; // 페이지당 게시글 수
const pagesPerGroup = 10; // 페이지 그룹당 표시할 페이지 수

// 날짜 문자열 (YYYY-MM-DD) => key (YYYY-MM) 변환
function formatDateKey(dateStr) {
    const [year, month] = dateStr.split('-');
    return `${year}-${month}`;
}

// YYYY-MM 형태 => "Month Year" 형식 문자열로 변환
function displayDateKey(key) {
    const [year, month] = key.split('-');
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// 글 목록을 월 단위로 그룹화
function groupByMonth(posts) {
    const map = new Map();

    posts.forEach(post => {
        const key = formatDateKey(post.date);
        map.set(key, (map.get(key) || 0) + 1);
    });

    const groups = [...map.entries()];

    // 최신 월부터 정렬
    groups.sort((firstEntry, secondEntry) => {
        const firstDate = new Date(firstEntry[0]);
        const secondDate = new Date(secondEntry[0]);
        return secondDate - firstDate;
    });

    return groups;
}

// 필터 렌더링
function renderFilters() {
    const filterList = document.querySelector(".archive_filter_list");
    filterList.innerHTML = "";

    const groups = groupByMonth(allPosts);

    groups.forEach(([key, count]) => {
        const li = document.createElement("li");
        li.textContent = `${displayDateKey(key)} (${count})`;

        // 클릭 시 해당 월에 해당하는 글만 필터링 적용
        li.onclick = () => {
            filterResultPosts = allPosts.filter(post => formatDateKey(post.date) === key);
            currentPageNumber = 1;
            currentPageGroup = 1;
            renderPosts(currentPageNumber);
        };

        filterList.appendChild(li);
    });
}

// 글 목록 렌더링
function renderPosts(page) {
    const postList = document.querySelector(".archive_content_list");
    postList.innerHTML = "";

    const totalFilteredPosts = filterResultPosts.length;
    const totalPages = Math.ceil(totalFilteredPosts / postsPerPage);

    const startPage = (page - 1) * postsPerPage;
    const endPage = startPage + postsPerPage;
    const pagePosts = filterResultPosts.slice(startPage, endPage);

    if (pagePosts.length === 0) {
        postList.innerHTML = "<div>No Posts</div>";
        return;
    }

    // 필터링을 적용한 글 목록 렌더링
    pagePosts.forEach(post => {
        const div = document.createElement("div");
        div.className = "archive_content_item";
        div.innerHTML = `
            <div class="post_item_title">
                <a href="/post/${post.id}">${post.title}</a>
            </div>
            <div class="post_item_content">${post.content}</div>
            <div class="post_item_information">${post.date} | Up-Vote : ${post.upvote}</div>
        `;
        postList.appendChild(div);
    });

    renderPages(totalPages);
}

// 페이지 버튼 렌더링
function renderPages(totalPages) {
    const pageList = document.querySelector(".page_list");
    pageList.innerHTML = "";

    const startGroup = (currentPageGroup - 1) * pagesPerGroup + 1;
    const endGroup = Math.min(startGroup + pagesPerGroup - 1, totalPages);

    for (let i = startGroup; i <= endGroup; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;

        pageButton.onclick = () => {
            currentPageNumber = i;
            renderPosts(currentPageNumber);
        };

        if (i === currentPageNumber) {
            pageButton.style.fontWeight = "bold";
        }

        pageList.appendChild(pageButton);
    }
}

// 이전 페이지 이동
function previousPage() {
    if (currentPageNumber > 1) {
        currentPageNumber--;

        if ((currentPageNumber - 1) % pagesPerGroup === pagesPerGroup - 1) {
            currentPageGroup--;
        }

        renderPosts(currentPageNumber);
    }
}

// 다음 페이지 이동
function nextPage() {
    const totalPages = Math.ceil(filterResultPosts.length / postsPerPage);

    if (currentPageNumber < totalPages) {
        currentPageNumber++;

        if ((currentPageNumber - 1) % pagesPerGroup === 0) {
            currentPageGroup++;
        }

        renderPosts(currentPageNumber);
    }
}

// 전체 글 로드 및 초기 렌더링
document.addEventListener("DOMContentLoaded", () => {
    async function loadData() {
        try {
            const response = await fetch("/api/posts");
            const data = await response.json();

            allPosts = data;
            filterResultPosts = [...allPosts]; // 초기 : 전체 게시글 사용

            renderFilters(); // 필터 메뉴 렌더링
            renderPosts(currentPageNumber); // 글 첫 페이지 렌더링
        } catch (error) {
            console.error("Failed to Load Posts : ", error);
        }
    }

    loadData();
});