from flask import Flask, render_template, url_for, request, redirect, flash, session
from dotenv import load_dotenv
from util import json_response
import mimetypes
import queries

from flask import jsonify
from functools import wraps
from os import urandom
import pass_util

mimetypes.add_type("application/javascript", ".js")
app = Flask(__name__)
app.secret_key = urandom(24)
load_dotenv()


def login_required(function):
    @wraps(function)
    def wrap(*args, **kwargs):
        if "id" in session:
            return function(*args, **kwargs)
        else:
            flash("You are not logged in")
            return redirect(url_for("login"))

    return wrap


def already_logged_in(function):
    @wraps(function)
    def wrap(*args, **kwargs):
        if "id" not in session:
            return function(*args, **kwargs)
        else:
            flash("You are already logged in, " + session["username"])
            return redirect(url_for("login_page"))

    return wrap


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template("index.html")


@app.route("/api/boards/public")
@json_response
def get_public_boards():
    """
    All the boards
    """
    return queries.get_public_boards()


@app.route("/api/boards/private")
@json_response
def get_private_boards():
    """
    All the boards
    """
    user_id = request.args["user"]
    return queries.get_private_boards(user_id)


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queries.get_cards_for_board(board_id)


@app.route("/api/new_board", methods=["POST"])
def add_new_board():
    data = request.get_json()
    id = queries.write_new_board(data["title"], data["user_id"])
    return jsonify(id)


@app.route("/api/new_card", methods=["POST"])
def add_new_card():
    data = queries.write_new_card(request.get_json(), request.get_json()["status"])
    return request.get_json()


@app.route("/api/rename_board", methods=["POST"])
def rename_board():
    data = request.get_json()
    writed_data = queries.rename_element(data, "boards")
    return writed_data


@app.route("/api/rename_column", methods=["POST"])
def rename_column():
    data = request.get_json()
    update_data = queries.rename_element(data, "statuses")
    return update_data


@app.route("/api/getStatuses", methods=["POST"])
def get_statuses():
    data = request.get_json()
    statuses = queries.get_statuses(data["boardId"])
    return jsonify(statuses)


@app.route("/api/default_columns", methods=["POST"])
def write_default_columns():
    id = request.get_json()
    return jsonify(queries.write_def_cols(id["boardId"]))


@app.route("/api/column", methods=["POST"])
def add_column():
    data = request.get_json()
    return jsonify(queries.add_new_column(data))


@app.route("/api/get_board", methods=["POST"])
def get_board():
    data = request.get_json()
    return jsonify(queries.get_board(data["id"]))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template("register.html")
    else:
        username = request.form.get("username")
        known_username = queries.get_user_by_email(username)
        if known_username:
            flash("Username already exists, please choose another one!")
            return redirect("/register")
        else:
            password = request.form.get("password")
            hashed_password = pass_util.hash_password(str(password))
            queries.add_new_user(username, hashed_password)
            flash("Successful registration. Log in to continue.")
            return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
@already_logged_in
def login():
    if request.method == "GET":
        return render_template("login.html")
    else:
        email_input = request.form.get("email")
        password_input = request.form.get("password")
        user_details = queries.get_user_by_email(email_input)

        if not user_details:
            flash("No such username")
            return redirect(url_for("login"))
        else:
            password_verified = pass_util.verify_password(
                password_input, user_details[0]["password"]
            )
            if not password_verified:
                flash("Wrong username or password")
                return redirect(url_for("login"))
            else:
                session["id"] = user_details[0]["id"]
                session["username"] = user_details[0]["username"]
                session["password"] = user_details[0]["password"]
                session["logged_in"] = True
                return redirect(url_for("index"))


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out")
    return render_template("login.html")


@app.post("/api/move_cards")
def move_cards():
    cardId = request.json.get("cardId")
    boardId = request.json.get("statusId")[2]
    statusId = request.json.get("statusId")[0]
    cardOrder = request.json.get("cardOrder")
    print(cardId, boardId, statusId, cardOrder)
    data = queries.update_card_order(cardId, boardId, statusId, cardOrder)
    print(data)
    return data


@app.route("/api/delete-board/<boardId>")
@json_response
def delete_board(boardId):
    # boardId = request.json.get("boardId")
    # print(boardId)
    # print("hahahah")
    queries.delete_board(boardId)
    return queries.get_public_boards()
    


def main():
    app.run(debug=True, port=5003)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule(
            "/favicon.ico",
            redirect_to=url_for("static", filename="favicon/favicon.ico"),
        )


if __name__ == "__main__":
    main()
