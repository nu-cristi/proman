import {dataHandler} from "../data/dataHandler.js";

import {
    htmlFactory,
    htmlTemplates,
    buttonBuilder,
    modalBuilder,
    addButtonBuilder,
    inputBuilder,
    newColumnBuilder,
} from "../view/htmlFactory.js";

import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";

export let boardsManager = {

    drake: dragula({}),

    loadBoards: async function () {
        let userId;
        let boards = []
        const publicBoards = await dataHandler.getPublicBoards();
        let privateButton = document.getElementById("create_private_board")

        if (privateButton) {
            userId = privateButton.dataset.userId; // one
            const privateBoards = await dataHandler.getPrivateBoards(userId);
            boards = privateBoards.concat(publicBoards);
        } else {
            boards = publicBoards;
        }
        
        await this.newBoard()
        let columns = document.getElementsByClassName("board-content");
        // console.log(columns);
        for (let board of boards) {
            // console.log(board);
            const statuses = await dataHandler.getStatuses(board.id);
            // console.log(statuses);
            const boardBuilder = htmlFactory(htmlTemplates.board);   //acestea sunt scripturi
            const content = boardBuilder(statuses, board);     //aici este inserat scriptul și devine un element real
            domManager.addChild("#root", content);
            this.dragAndDrop(board.id);
            domManager.addEventListenerToMore(
                `.board-title`,
                "dblclick",
                renameBoardTitle
            );

            domManager.addEventListenerToMore(
                `.arrow-board-toggle[data-board-id="${board.id}"]`,
                "click",
                showHideButtonHandler
            );

            domManager.addEventListenerToMore(
                    '.board-column-title',
                    'dblclick',
                     renameColumnTitle
            );
            domManager.addEventListener(
                `.delete[data-board-id="${board.id}"]`,
                'click',
                deleteBoardById
            );

            
        }
        for (let column of columns) {
            column.style.visibility = "hidden";
        }
    },
    newBoard: async function () {
            const button = buttonBuilder()
            domManager.addChild("#root", button);
            domManager.addEventListener(`#create_new_board`, 'click', addBoardTitle)
    },
    
    dragAndDrop: function (boardId) {
        const cardContainers = document.querySelectorAll(`.board[data-board-id="${boardId}"] .board-column-content`)
        // let containers = []; 
        for (let cardContainer of cardContainers) {
            const string = `.board[data-board-id="${boardId}"] .` + cardContainer.classList[cardContainer.classList.length - 1];
            const selectContainer = document.querySelector(string);
            this.drake.containers.push(selectContainer);
        }
        this.drake.on('drop', async function (e) {
            const statusId = e.parentElement.dataset.status;
            
            let cardsOrder = [];
            const statusElement = e.parentElement.children;
            for (let i = 0; i < statusElement.length; i++){
                const cardIdAndOrder = {
                    cardId: parseInt(statusElement[i].dataset.cardId),
                    cardOrder: i + 1
                }
                dataHandler.moveCards(cardIdAndOrder.cardId, boardId, statusId, cardIdAndOrder.cardOrder);
                cardsOrder.push(cardIdAndOrder);
            }
        
        })
    }
};

async function deleteBoardById(clickEvent) {
    const boardId = clickEvent.target.attributes['data-board-id'].nodeValue;
    console.log(boardId);
    await dataHandler.deleteBoard(boardId);
    let parent = document.querySelector(".board-container")
    let boards = parent.querySelectorAll('.board');
    for (let board of boards) {
        if (boardId === board.attributes['data-board-id'].nodeValue) {
            root.removeChild(board);
            break;
        }
    }
    document.getElementById('root').innerHTML = '';
    await boardsManager.loadBoards();
    
}
async function addNewCard(clickEvent) {
    const boardId = clickEvent.target.parentElement.parentElement.dataset.boardId

    const newCardModalTitle = modalBuilder('new_card') // modal
    domManager.addChild('#root', newCardModalTitle);
    $('.modal').modal('toggle'); // call modal
    domManager.addEventListener('#create', 'click', async function () {
        const cardTitle = $('#new-element-title').val() // new text value
        let statuses = await dataHandler.getStatuses(boardId);
        console.log(statuses);
        await dataHandler.createNewCard(cardTitle, boardId, statuses[0].id);
        document.getElementsByClassName('modal')[0].remove()

        $(`.arrow-board-toggle[data-board-id="${boardId}"]`).click()
        $(`.arrow-board-toggle[data-board-id="${boardId}"]`).click()

    })
    domManager.addEventListener('.close', 'click', async function () {
        document.getElementById('root').innerHTML = ''
        await boardsManager.loadBoards()
    })
}




function renameBoardTitle (clickEvent) {
    const boardId = clickEvent.target.dataset.boardId; //id
    let actualBoard = clickEvent.target
    console.log(actualBoard);
    actualBoard.style.visibility = "hidden";
    const inputbar = inputBuilder("board");
    let parent = clickEvent.target.parentElement //class = bord-header;
    parent.insertBefore(inputbar[1], parent.childNodes[0]);
    parent.insertBefore(inputbar[0], parent.childNodes[0]);

    let ignoreClickOnMeElement = inputbar[0];
    document.addEventListener("click", isOutside);

    domManager.addEventListener(".rename-board", "click", async function () {
        let newTitle = inputbar[0].value
        await dataHandler.renameBoard(boardId, newTitle);
        inputbar[0].remove();
        inputbar[1].remove();
        actualBoard.style.visibility = "visible";
        actualBoard.textContent = newTitle;
        document.removeEventListener("click", isOutside)

    })

    function isOutside (event) {
        if (event.target !== ignoreClickOnMeElement) {
            document.removeEventListener("click", isOutside)
            // console.log("na");
            inputbar[0].remove() //input field
            inputbar[1].remove() //button
            actualBoard.style.visibility = "visible"
        }
    }


}


domManager.addEventListener(`#create_private_board`, 'click', addBoardTitle)      //de comentat
function addBoardTitle(clickEvent) {
    let userId = clickEvent.target.dataset.userId
    const newBoardModalTitle = modalBuilder('new_board')
    domManager.addChild('#root', newBoardModalTitle);
    $('.modal').modal('toggle');
    domManager.addEventListener('#create', 'click', async function () {
        const boardTitle = $('#new-element-title').val()
        const boardId = await dataHandler.createNewBoard(boardTitle, userId);
        await dataHandler.writeDefaultColumns(boardId[0].id)

        document.getElementById('root').innerHTML = ''

        await boardsManager.loadBoards()
    })
    domManager.addEventListener('.close', 'click', async function () {
        document.getElementById('root').innerHTML = ''
        await boardsManager.loadBoards()
    })
}


async function showHideButtonHandler(clickEvent) {
    let header = clickEvent.target.parentElement
    let columns = document.getElementsByClassName('board-content')
    let boardId = clickEvent.target.dataset.boardId
    let changeButton = document.querySelector(`.arrow-board-toggle[data-board-id="${boardId}"]`) // our button switch
    changeButton.src = "../static/left.png"; // if you click and go left
    
    if (clickEvent.target.dataset.show === "false") {
        const boardId = clickEvent.target.dataset.boardId;
        const addColumnButton = addButtonBuilder('column')
        const addCardButton = addButtonBuilder('card')
        await cardsManager.loadCards(boardId);            // de comentat
        clickEvent.target.dataset.show = "true";
        for (let column of columns) {
            if (boardId === column.dataset.boardId) {
                column.previousElementSibling.children[1].insertAdjacentHTML('beforebegin', addColumnButton)
                column.previousElementSibling.children[1].insertAdjacentHTML('beforebegin', addCardButton)
                column.style.visibility = "visible";
                domManager.addEventListenerToMore(
                    '.add-card',
                    'click',
                    addNewCard);
                domManager.addEventListenerToMore(
                    '.add-column',
                    'click',
                    addNewColumn);
            }
        }
        
    } else {
        changeButton.src = "../static/downs.png";
        header.removeChild(header.children[1])
        header.removeChild(header.children[1])
        for (let column of columns) {
            if (boardId === column.dataset.boardId) {

                let cards = document.getElementsByClassName('board-column-content')

                for (let col of cards) {
                    col.innerHTML = ''
                }
                column.style.visibility = "hidden";
                clickEvent.target.dataset.show = "false";
            }
        }

    }
    

}

async function renameColumnTitle (clickEvent) {
    const columnId = clickEvent.target.dataset.status //1_1 sau 1_2
    // console.log(columnId);
    let actualColumn = clickEvent.target // div - board-column-title
    // console.log(actualColumn);
    actualColumn.style.visibility = "hidden" ; // div hidden
    const inputbar = inputBuilder("column") // creeaza un elem type input text si un elem button(are clasa rename-column)
    // console.log(inputbar);
    let parent = clickEvent.target.parentElement // board-header adica board-column
    // console.log(parent);
    parent.insertBefore(inputbar[1], parent.childNodes[0])  //inputbar[1] - button
    parent.insertBefore(inputbar[0], parent.childNodes[0])  // inputbar[0] - <input type text>

    let ignoreClickOnMeElement = inputbar[0];
    document.addEventListener("click", isOutside)

    domManager.addEventListener(".rename-column", "click", async function () {
        let newStatus = inputbar[0].value  // input text field
        await dataHandler.renameColumn(columnId, newStatus); // param (1_1, value of input text field)
        actualColumn.textContent = newStatus;
        inputbar[0].remove()  // input text field
        inputbar[1].remove() // the button
        actualColumn.style.visibility = "visible";
        document.removeEventListener("click", isOutside);

    })

    function isOutside(event) {
        if (event.target !== ignoreClickOnMeElement) {
            document.removeEventListener("click", isOutside)
            console.log("outside");
            inputbar[0].remove() //input field
            inputbar[1].remove()//button
            actualColumn.style.visibility = "visible" //il face vizibil din nou
        }
    }


}

async function addNewColumn (clickEvent) {
    const boardId = clickEvent.target.parentElement.parentElement.dataset.boardId //is the id of the board where you click- 1 or 2 etc
    // console.log(boardId);
    const newColumnModalTitle = modalBuilder("new_column"); // modal
    // console.log(newColumnModalTitle);
    domManager.addChild("#root", newColumnModalTitle);
    $('.modal').modal('toggle');
    domManager.addEventListener('#create', 'click', async function () {
        const columnTitle = $('#new-element-title').val()
        let columns = clickEvent.target.parentElement.nextElementSibling.children;
        // console.log(columns);
        let status = await dataHandler.writeNewStatus(columnTitle, boardId);
        let newColumn = newColumnBuilder(columnTitle, boardId, status[0].id);
        document.getElementsByClassName('modal')[0].remove()
        columns[0].insertAdjacentHTML('beforeend', newColumn)
        // makeDroppable.droppableBoards();                 //comentat

        document.getElementById('root').innerHTML = ''

        let createColumnButton = document.querySelector('.btn-primary');
        console.log(createColumnButton);
        await boardsManager.loadBoards();

    })
         domManager.addEventListener('.close', 'click', async function () {
        document.getElementById('root').innerHTML = ''
        await boardsManager.loadBoards()
    })
}













