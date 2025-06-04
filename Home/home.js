document.addEventListener("DOMContentLoaded", () => {
    // 1. Khai báo config cho từng section
    const sectionConfigs = {
        now: {
            container: document.querySelector("#Home"),
            loadMoreButton: document.querySelector(".home-container button"),
            state: { page: 1, isLoading: false, displayed: new Set() },
            fetchUrl: page => `https://api.jikan.moe/v4/seasons/now?page=${page}`,
            renderItem: (container, anime, state) => {
                if (anime.status === "Not yet aired" || state.displayed.has(anime.title)) return;
                state.displayed.add(anime.title);
                const card = document.createElement("div");
                card.className = "animecard";
                card.dataset.id = anime.mal_id;
                card.innerHTML = `
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}"
               style="width:280px;height:400px;border-radius:10px;">
          <h3 style="padding:10px;">${anime.title}</h3>
          <p>Score: ${anime.score ?? "N/A"}</p>
          <p>Episodes: ${anime.episodes ?? "?"}</p>
          <p>Status: ${anime.status}</p>
        `;
                container.appendChild(card);
            },
            onFetchSuccess: (data, config) => {
                data.data.forEach(anime => config.renderItem(config.container, anime, config.state));
                if (!data.pagination?.has_next_page) config.loadMoreButton.style.display = "none";
            }
        },

        popular: {
            container: document.querySelector("#Popular"),
            loadMoreButton: document.querySelector(".popular-container button"),
            state: { page: 1, isLoading: false, displayed: new Set() },
            fetchUrl: page => `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${page}`,
            renderItem: (container, anime, state) => {
                if (anime.status === "Not yet aired" || state.displayed.has(anime.title)) return;
                state.displayed.add(anime.title);
                const card = document.createElement("div");
                card.className = "animecard";
                card.dataset.id = anime.mal_id;
                card.innerHTML = `
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}"
               style="width:280px;height:400px;border-radius:10px;">
          <h3 style="padding:10px;">${anime.title}</h3>
          <p>Score: ${anime.score ?? "N/A"}</p>
          <p>Episodes: ${anime.episodes ?? "?"}</p>
          <p>Status: ${anime.status}</p>
        `;
                container.appendChild(card);
            },
            onFetchSuccess: (data, config) => {
                data.data.forEach(anime => config.renderItem(config.container, anime, config.state));
                if (!data.pagination?.has_next_page) config.loadMoreButton.style.display = "none";
            }
        },

        genre: {
            container: document.querySelector("#Genre"),
            loadMoreButton: document.querySelector(".genre-container button"),
            state: { isLoading: false, fullList: [], shownCount: 0 },
            fetchUrl: () => `https://api.jikan.moe/v4/genres/anime`,
            renderBatch: config => {
                const { container, state, loadMoreButton } = config;
                const start = state.shownCount;
                const batch = state.fullList.slice(start, start + 12);
                batch.forEach(item => {
                    const box = document.createElement("div");
                    box.className = "animetextbox";
                    box.innerHTML = `<h3 style="padding:10px; text-align:center;">${item.name}</h3>`;
                    container.appendChild(box);
                });
                state.shownCount += batch.length;
                if (state.shownCount >= state.fullList.length) loadMoreButton.style.display = "none";
            },
            onFetchSuccess: (data, config) => {
                config.state.fullList = data.data;
                config.renderBatch(config);
            }
        },

        season: {
            container: document.querySelector("#Season"),
            loadMoreButton: document.querySelector(".season-container button"),
            state: { isLoading: false, yearsList: [], shownCount: 0 },
            fetchUrl: () => `https://api.jikan.moe/v4/seasons`,
            renderBatch: config => {
                const { container, state, loadMoreButton } = config;
                const start = state.shownCount;
                const batch = state.yearsList.slice(start, start + 12);
                batch.forEach(item => {
                    const box = document.createElement("div");
                    box.className = "animetextbox";
                    box.innerHTML = `<h3 style="padding:10px; text-align:center;">${item.year}</h3>`;
                    container.appendChild(box);
                });
                state.shownCount += batch.length;
                if (state.shownCount >= state.yearsList.length) loadMoreButton.style.display = "none";
            },
            onFetchSuccess: (data, config) => {
                // Lấy distinct các năm và sắp xếp giảm dần
                const yearsSet = new Set(data.data.map(item => item.year));
                config.state.yearsList = Array.from(yearsSet)
                    .sort((a, b) => b - a)
                    .map(year => ({ year }));
                config.renderBatch(config);
            }
        },

        type: {
            container: document.querySelector("#Type"),
            loadMoreButton: document.querySelector(".type-container button"),
            state: { shown: false },
            renderOnce: config => {
                const types = ["TV", "Movie", "OVA", "Special", "ONA", "Music"];
                types.forEach(name => {
                    const box = document.createElement("div");
                    box.className = "animetextbox";
                    box.innerHTML = `<h3 style="padding:10px; text-align:center;">${name}</h3>`;
                    config.container.appendChild(box);
                });
                config.loadMoreButton.style.display = "none";
                config.state.shown = true;
            }
        }
    };


    // 2. Generic fetch-and-render function
    const fetchAndRender = async config => {
        const { state, fetchUrl, onFetchSuccess } = config;
        if (state.isLoading) return;
        state.isLoading = true;

        try {
            const response = await fetch(fetchUrl(state.page));
            const data = await response.json();
            onFetchSuccess(data, config);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            state.isLoading = false;
        }
    };


    // 3. Khởi chạy lần đầu cho từng section
    // - Home & Popular: gọi ngay fetch
    // - Genre & Season: gọi fetch rồi render batch đầu
    // - Type: render tĩnh một lần
    fetchAndRender(sectionConfigs.now);
    fetchAndRender(sectionConfigs.popular);
    fetchAndRender(sectionConfigs.genre);
    fetchAndRender(sectionConfigs.season);
    sectionConfigs.type.renderOnce(sectionConfigs.type);


    // 4. Đăng ký sự kiện “Load More” cho từng section
    sectionConfigs.now.loadMoreButton.addEventListener("click", () => {
        sectionConfigs.now.state.page++;
        fetchAndRender(sectionConfigs.now);
    });

    sectionConfigs.popular.loadMoreButton.addEventListener("click", () => {
        sectionConfigs.popular.state.page++;
        fetchAndRender(sectionConfigs.popular);
    });

    sectionConfigs.genre.loadMoreButton.addEventListener("click", () => {
        fetchAndRender(sectionConfigs.genre);
    });

    sectionConfigs.season.loadMoreButton.addEventListener("click", () => {
        fetchAndRender(sectionConfigs.season);
    });

    // Type không cần event listener vì chỉ render 1 lần


    // 5. Chuyển trang khi click vào animecard (Home & Popular)
    document.body.addEventListener("click", e => {
        const card = e.target.closest(".animecard");
        if (!card) return;
        const parentSectionId = card.closest("section")?.id;
        if (parentSectionId === "Home" || parentSectionId === "Popular") {
            window.location.href = `../Anime-Detail/detail.html?id=${card.dataset.id}`;
        }
    });
});
