document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".detail-container");
    // Lấy id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get("id");

    if (!animeId) {
        container.innerHTML = "<h2>Anime ID không hợp lệ</h2>";
        return;
    }

    try {
        const respone = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
        const data = await respone.json();
        const anime = data.data;

        container.innerHTML = `
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" class="detail-anime-image">
                <div class="detail-anime-info">
                    <h1 style="margin-bottom: 3px;">${anime.title}</h1>
                    <p><strong>Score:</strong> ${anime.score ?? "N/A"}</p>
                    <p><strong>Episodes:</strong> ${anime.episodes ?? "?"}</p>
                    <p><strong>Status:</strong> ${anime.status}</p>
                    <p style="white-space: pre-wrap;"><strong>Synopsis:</strong> ${anime.synopsis ?? "No synopsis available."}</p>
                    <p><strong>Genres:</strong> ${anime.genres.map(g => g.name).join(", ")}</p>
                    <p><strong>Aired:</strong> ${anime.aired.string}</p>
                    <button type="">Xem Anime</button>`
    }
    catch (error) {
        container.innerHTML = "<h2>Không thể tải thông tin anime</h2>";
        console.error("Error fetching anime details:", error);
    }
});