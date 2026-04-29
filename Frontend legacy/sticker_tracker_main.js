document.getElementById("testsubmit").addEventListener("click", function() {
    console.log("FC Utrecht de beste");
});

document.getElementById("stickerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("http://localhost:3000/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Server response:", result);

    } catch (error) {
        console.error("Error:", error);
    }
});