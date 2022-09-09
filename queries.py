import data_manager
from psycopg2 import sql


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """,
        {"status_id": status_id},
        fetchall=True,
    )

    return status


def get_public_boards():
    """
    Gather all boards
    :return:
    """
    # remove this code once you implement the database
    # return [{"title": "board1", "id": 1}, {"title": "board2", "id": 2}]

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        WHERE user_id IS NULL 
        ;
        """,
        fetchall=True,
    )


def get_private_boards(user_id):
    """
    Gather all boards
    :return:
    """
    # remove this code once you implement the database
    # return [{"title": "board1", "id": 1}, {"title": "board2", "id": 2}]

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        WHERE user_id = %(user_id)s
        ;
        """,
        {"user_id": user_id},
        fetchall=True,
    )


def get_cards_for_board(board_id):
    # remove this code once you implement the database
    # return [{"title": "title1", "id": 1}, {"title": "board2", "id": 2}]

    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ORDER by card_order ASC
        ;
        """,
        {"board_id": board_id},
        fetchall=True,
    )

    return matching_cards


def write_new_board(title, user_id):
    return data_manager.execute_select(
        """INSERT INTO boards (title, user_id) VALUES (%(title)s, %(id)s) 
        returning id""",
        {"title": title, "id": user_id},
        fetchall=True,
    )


def write_def_cols(id):
    return data_manager.execute_select(
        """INSERT INTO statuses (title, board_id)
           VALUES ('new', %(board_id)s), 
                  ('in progress', %(board_id)s), 
                  ('testing', %(board_id)s), 
                  ('done', %(board_id)s)
                  returning statuses""",
        {"board_id": id},
    )


def write_new_card(data, status):
    data_manager.execute_select(
        """INSERT INTO cards (board_id, status_id, title, card_order) 
        VALUES (%(board_id)s, %(status)s, %(title)s, 1)
        returning cards""",
        {"title": data["title"], "board_id": data["board_id"], "status": status},
        fetchall=True,
    )


def rename_element(data, table_name="boards"):
    # update boards set title = (dataHandler newStatus) where id = (dataHandler id) returning id
    data_manager.execute_select(
        sql.SQL(
            """UPDATE {table_name}
        SET {updated_column} = {title_name}
        WHERE {wheree} = {id}
        returning id"""
        ).format(
            updated_column=sql.Identifier("title"),
            table_name=sql.Identifier(table_name),
            title_name=sql.Literal(data["title"]),
            wheree=sql.Identifier("id"),
            id=sql.Literal(data["id"]),
        )
    )
    return data


def add_new_column(data):
    return data_manager.execute_select(
        """iNSERT INTO statuses (title, board_id)
        VALUES (%(title)s, %(board_id)s)
        returning id""",
        {"title": data["title"], "board_id": data["boardId"]},
    )


def get_user_by_email(email_input):

    data = data_manager.execute_select(
        """SELECT *
        FROM users
        WHERE username = %(username)s
        """,
        {"username": email_input},
    )
    return data


def add_new_user(user, password):
    data_manager.execute_update(
        """INSERT INTO users
         (username, password) 
         VALUES 
         (%(user)s, %(password)s)""",
        {"user": user, "password": password},
    )


def get_statuses(board_id):
    return data_manager.execute_select(
        """SELECT *
        FROM statuses
        WHERE board_id=%(board_id)s
        ORDER BY id
        """,
        {"board_id": board_id},
    )


def get_board(id):
    return data_manager.execute_select(
        """SELECT *
        FROM boards
        WHERE id = %(id)s""",
        {"id": id},
    )


def update_card_order(cardId, boardId, statusId, cardOrder):
    data_manager.execute_select(
        """
    UPDATE cards SET board_id = %(boardId)s, status_id=%(statusId)s, card_order=%(cardOrder)s
    WHERE id = %(cardId)s returning id""",
        {
            "cardId": cardId,
            "boardId": boardId,
            "statusId": statusId,
            "cardOrder": cardOrder,
        },
        False,
    )


def delete_board(boardId):
    data_manager.execute_select(
        """DELETE  FROM boards WHERE id = %(boardId)s RETURNING id""", {"boardId": boardId}
    )



