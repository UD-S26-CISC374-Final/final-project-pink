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

    const draggableDiv1 = document.createElement("div");

    Object.assign(draggableDiv1.style, {
        width: "100px",
        height: "50px",
        backgroundColor: "#ff00ff",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Google Sans Code",
        fontSize: "14px",
        cursor: "move",
        position: "absolute",
        left: "0px",
        top: "0px",
    });

    draggableDiv1.textContent = "Drag me!";

    let offsetX: number, offsetY: number;

    const mouseMoveHandler = (e: MouseEvent) => {
        const containerRect = container.getBoundingClientRect();

        const x = e.clientX - containerRect.left - offsetX;
        const y = e.clientY - containerRect.top - offsetY;

        if (x <= -5 || y <= -5 || x >= 764 || y >= 480) return;

        // get the current div being dragged and move it
        draggableDiv1.style.left = `${x}px`;
        draggableDiv1.style.top = `${y}px`;
    };

    const mouseUpHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
    };

    draggableDiv1.addEventListener("mousedown", (e) => {
        const rect = draggableDiv1.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    });

    container.appendChild(draggableDiv1);
    scene.add.dom(0, 0, container).setOrigin(0, 0);
}


// export default function showDraggableTestCases(scene: Phaser.Scene) {
//     const SCREEN_W = 860;
//     const SCREEN_H = 520;

//     const container = document.createElement("div");
//     container.id = "draggable-area";

//     Object.assign(container.style, {
//         position: "relative",
//         width: `${SCREEN_W}px`,
//         height: `${SCREEN_H}px`,
//         marginTop: "205px",
//         marginLeft: "78px",
//         border: "2px solid #00ff00",
//     });

//     const draggableDiv1 = document.createElement("div");

//     Object.assign(draggableDiv1.style, {
//         width: "100px",
//         height: "50px",
//         backgroundColor: "#ff00ff",
//         color: "#ffffff",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         fontFamily: "Google Sans Code",
//         fontSize: "14px",
//         cursor: "move",
//         position: "absolute",
//         left: "0px",
//         top: "0px",
//     });

//     draggableDiv1.textContent = "Drag me!";

//     let offsetX: number, offsetY: number;

//     const mouseMoveHandler = (e: MouseEvent) => {
//         const containerRect = container.getBoundingClientRect();

//         const x = e.clientX - containerRect.left - offsetX;
//         const y = e.clientY - containerRect.top - offsetY;

//         if (x <= -5 || y <= -5 || x >= 764 || y >= 480) return;

//         // get the current div being dragged and move it
//         draggableDiv1.style.left = `${x}px`;
//         draggableDiv1.style.top = `${y}px`;
//     };

//     const mouseUpHandler = () => {
//         document.removeEventListener("mousemove", mouseMoveHandler);
//         document.removeEventListener("mouseup", mouseUpHandler);
//     };

//     draggableDiv1.addEventListener("mousedown", (e) => {
//         const rect = draggableDiv1.getBoundingClientRect();

//         offsetX = e.clientX - rect.left;
//         offsetY = e.clientY - rect.top;

//         document.addEventListener("mousemove", mouseMoveHandler);
//         document.addEventListener("mouseup", mouseUpHandler);
//     });

//     container.appendChild(draggableDiv1);
//     scene.add.dom(0, 0, container).setOrigin(0, 0);
// }
