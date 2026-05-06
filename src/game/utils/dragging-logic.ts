export default function showDraggableTestCases(scene: Phaser.Scene) {
    const SCREEN_W = 860;
    const SCREEN_H = 520;

    const container = document.createElement("div");
    container.id = "draggable-area";

    Object.assign(container.style, {
        position: "relative",
        width: `${SCREEN_W}px`,
        height: `${SCREEN_H}px`,
        marginTop: "205px",
        marginLeft: "78px",
        border: "2px solid #00ff00",
    });

    const draggableDivsContainer = document.createElement("div");
    Object.assign(draggableDivsContainer.style, {
        width: "85%",
        height: "50%",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        border: "1px solid #ff00ff",
        padding: "10px",
        overflowY: "auto",
        alignItems: "flex-start",
    });

    const numDraggableDivs = 5;
    for (let i = 0; i < numDraggableDivs; i++) {
        const draggableDiv = document.createElement("div");

        Object.assign(draggableDiv.style, {
            backgroundColor: "#ff00ff",
            color: "#ffffff",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Google Sans Code",
            fontSize: "14px",
            cursor: "move",
            position: "relative",
            padding: "6px 10px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
        });

        draggableDiv.id = `draggable-div-${i}`;
        draggableDiv.textContent = `Drag me ${i + 1}!`;
        draggableDivsContainer.appendChild(draggableDiv);
    }

    let offsetX = 0;
    let offsetY = 0;

    draggableDivsContainer.querySelectorAll("div").forEach((draggableDiv) => {
        draggableDiv.addEventListener("mousedown", (e: MouseEvent) => {
            offsetX = 0;
            offsetY = 0;
            e.preventDefault();

            const rect = draggableDiv.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            const containerRect =
                draggableDivsContainer.getBoundingClientRect();

            const mouseMoveHandler = (e: MouseEvent) => {
                const x = e.clientX - containerRect.left - offsetX;
                const y = e.clientY - containerRect.top - offsetY;

                draggableDiv.style.position = "absolute";

                if (x <= -5 || y <= -5 || x >= 764 || y >= 480) return;

                draggableDiv.style.left = `${x}px`;
                draggableDiv.style.top = `${y}px`;
            };

            const mouseUpHandler = () => {
                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };

            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);
        });
    });

    container.appendChild(draggableDivsContainer);
    scene.add.dom(0, 0, container).setOrigin(0, 0);
}
