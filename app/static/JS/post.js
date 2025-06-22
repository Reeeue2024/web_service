document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 로그인 상태 확인 요청
        const response = await fetch("/api/auth");
        const data = await response.json();

        if (!data.is_log_in) {
            // 로그인이 되지 않은 경우 : 경고 후 로그인 페이지로 이동
            alert("You Need to Log In to Access to Post");
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("Fail to Check Log In : ", error);
        alert("Fail to Check Log In");
        window.location.href = "/login";
    }

    const postForm = document.querySelector(".post_form");
    const postTitle = document.getElementById("post_title");
    const postContent = document.getElementById("post_content");
    const postDate = document.getElementById("post_date");

    // 글 작성 폼 제출 시 처리
    postForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = postTitle.value.trim();
        const content = postContent.value.trim();
        const date = postDate.value;

        // 모든 입력 필드가 채워졌는지 확인
        if (!title || !content || !date) {
            alert("Require : All Fields");
            return;
        }

        try {
            // 서버에 게시글 작성 요청
            const response = await fetch("/api/posts", {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({ title, content, date })
            });

            if (!response.ok) {
                throw new Error("Server Error While Do Post");
            }

            const result = await response.json();

            alert("Success to Post!");
            window.location.href = "/";  // 작성 성공 시 홈으로 이동
        } catch (err) {
            console.error("Failed to Post : ", err);
            alert("Fail to Post");
        }
    });
});