let allPosts = [];

let currentPageNumber = 1;
let currentPageGroup = 1;

const postsPerPage = 10; // 한 페이지에 표시할 글 수
const pagesPerGroup = 10; // 한 페이지 그룹에 포함될 페이지 수

// Render : Posts
function renderPosts(page) {
    const postList = document.querySelector(".post_list");
    postList.innerHTML = "";

    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const totalGroups = Math.ceil(totalPages / pagesPerGroup);

    const startPage = (page - 1) * postsPerPage;
    const endPage = startPage + postsPerPage;
    const pagePosts = allPosts.slice(startPage, endPage); // 현재 페이지에 해당하는 글 추출

    if (pagePosts.length === 0) {
        postList.innerHTML = "<div>No Posts</div>";
        return;
    }

    // 글 목록 렌더링
    pagePosts.forEach(post => {
        const div = document.createElement("div");

        div.className = "post_item";
        div.innerHTML = `
            <div class="post_item_title">
                <a href="/post/${post.id}">${post.title}</a>
            </div>
            <div class="post_item_content">${post.content}</div>
            <div class="post_item_information">${post.date} | Up-Vote : ${post.upvote}</div>
        `;

        postList.appendChild(div);
    });

    renderPages(totalPages); // 페이지 버튼 렌더링
}

// Render : Page Buttons
function renderPages(totalPages) {
    const pageList = document.querySelector(".page_list");
    pageList.innerHTML = "";

    const startGroup = (currentPageGroup - 1) * pagesPerGroup + 1;
    const endGroup = Math.min(startGroup + pagesPerGroup - 1, totalPages);

    for (let i = startGroup; i <= endGroup; i++) {
        const pageButton = document.createElement("button");

        pageButton.textContent = i;

        // 페이지 버튼 클릭 시 페이지 렌더링
        pageButton.onclick = () => {
            currentPageNumber = i;
            renderPosts(currentPageNumber);
        };

        // 현재 페이지는 강조 표시
        if (i === currentPageNumber) {
            pageButton.style.fontWeight = "bold";
        }

        pageList.appendChild(pageButton);
    }
}

// Previous Page 이동
function previousPage() {
    const totalPages = Math.ceil(allPosts.length / postsPerPage);

    if (currentPageNumber > 1) {
        currentPageNumber--;

        // 그룹 경계 이동 시, 페이지 그룹 감소
        if ((currentPageNumber - 1) % pagesPerGroup === pagesPerGroup - 1) {
            currentPageGroup--;
        }

        renderPosts(currentPageNumber);
    }
}

// Next Page 이동
function nextPage() {
    const totalPages = Math.ceil(allPosts.length / postsPerPage);

    if (currentPageNumber < totalPages) {
        currentPageNumber++;

        // 그룹 경계 이동 시 페이지 그룹 증가
        if ((currentPageNumber - 1) % pagesPerGroup === 0) {
            currentPageGroup++;
        }

        renderPosts(currentPageNumber);
    }
}

// 초기 데이터 로딩 및 렌더링
document.addEventListener("DOMContentLoaded", () => {
    async function loadData() {
        try {
            const response = await fetch("/api/posts");
            const data = await response.json();

            allPosts = data;

            renderPosts(currentPageNumber);  // 첫 페이지 렌더링
        } catch (error) {
            console.error("Failed to Load Posts : ", error);
        }
    }

    loadData();
});