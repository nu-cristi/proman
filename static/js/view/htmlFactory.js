import { domManager } from "../view/domManager.js";
import {cardsManager} from "../controller/cardsManager.js";

export const htmlTemplates = {
    board: 1,
    card: 2
}

// export const builderFunctions = {
//     [htmlTemplates.board]: boardBuilder,
//     [htmlTemplates.card]: cardBuilder
// };

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.card:
            return cardBuilder
        default:
            console.error("Undefined template: " + template)
            return () => {
                return ""
            }
    }
}

export function inputBuilder(type) {
    let inp = document.createElement("input");
        inp.setAttribute("class", "rename");
        inp.setAttribute("type", "text");

    let butt = document.createElement("button");
        butt.setAttribute("class", `rename-${type}`);
        butt.setAttribute("type", "submit");
        butt.textContent = "Save"

    return [inp, butt]


}


function boardBuilder(statuses, board) {
    let columns = []
    // console.log(columns);
    for (let col of statuses) {
        // console.log(col.board_id);
        columns.push(`<div class="board-column">
                    <div class="board-column-title" data-status="${col.id}_${col.board_id}" data-column="${col.id}" 
                        data-board="${col.board_id}">${col.title}
                        <button type="button" class="icon-button right fas fa-trash-alt" id="delete_column_${col.id}" 
                        style="float: right"></button>
                    </div>

                    <div class="board-column-content board-column-content${col.id}" data-status="${col.id}_${col.board_id}" 
                    data-board-id="${col.board_id}"></div>
                </div>`)
    }
    // console.log(columns.join(''));
    return (
        `<div class="board-container">
            <section class="board" data-board-id=${board.id}>
                <div class="board-header"><span id='title' class="board-title" 
                    data-board-id=${board.id}>${board.title}</span> 
                    <button type="button" 
                    class="icon-button right fas fa-trash-alt delete" data-board-id="${board.id}"></button>
                    <button type="button" class="board-toggle fas fa-folder" id="archived_cards_${board.id}" 
                        data-board-id="${board.id}" data-show="false" style="float: right"></button>      
                    <input type="image" src="../static/downs.png" width="20" class="arrow-board-toggle" 
                        data-board-id="${board.id}" data-show="false"/>
                </div>
            <div class="board-content" data-board-id="${board.id}">
                <div class="board-columns">` +
        columns.join('') +
        `</div>
            </div>
            
            </section>
            </div>`
    );
}

function cardBuilder(card) {
    return `<div class="card" data-card-id="${card.id}">${card.title}</div>`;
}

export function buttonBuilder() {
    return `<button type="button" class="btn btn-outline-dark" data-toggle="modal" data-targhet="#newBoard"
        id="create_new_board" name="new_board" >Create new board</button>`;
}


export function addButtonBuilder(type) {
    return `<button type="button" style="margin-right: 20px" class="add-${type}">Add ${type}</button>`
}

export function modalBuilder(type) {
    return `<div class="modal" id="${type}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">For create a ${type} choose a name </h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
<!--                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="float: right" aria-label="Close">X</button>-->
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <form>
                      <div class="form-group">
                        <label for="new-element-title" class="col-form-label">Title:</label>
                        <input type="text" class="form-control" id="new-element-title">
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="create" data-bs-dismiss="modal">Create</button>
                  </div>
                </div>
              </div>
            </div>`
}


export function newColumnBuilder(title, boardId, status) {
    return `<div class="board-column">
                    <div class="board-column-title">${title}
                        <button type="button" class="icon-button right fas fa-trash-alt" id="delete_column_${status}" style="float: right"></button>     
                    </div>    
                    <div class="board-column-content board-column-content${status}" data-status="${status}_${boardId}"></div>
                </div>`
}








