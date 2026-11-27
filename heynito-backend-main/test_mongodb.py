from backend.mongodb import (
    connect_mongodb,
    initialize_indexes,
    close_mongodb,
    db
)


if __name__ == "__main__":

    try:
        connect_mongodb()

        initialize_indexes()

        print("\nAvailable collections:")

        for name in sorted(db.list_collection_names()):
            print(f" - {name}")

    finally:
        close_mongodb()