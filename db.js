const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

module.exports.selectAllImages = () => {
    return db.query(
        `
            SELECT * FROM images
            LEFT JOIN (
                SELECT COUNT(id) AS "numOfComments", image_id
                FROM comments
                GROUP BY image_id
            ) AS commentsPerImage
            ON commentsPerImage.image_id = images.id
            ORDER BY created_at DESC
            LIMIT 5
        `
    );
};

module.exports.selectMoreImages = (lowestId) => {
    return db.query(
        `
            SELECT * FROM images
            LEFT JOIN (
                SELECT COUNT(id) AS "numOfComments", image_id
                FROM comments
                GROUP BY image_id
            ) AS commentsPerImage
            ON commentsPerImage.image_id = images.id
            WHERE id < $1
            ORDER BY created_at DESC
            LIMIT 3
        `,
        [lowestId]
    );
};

module.exports.selectImage = (imageId) => {
    return db.query(
        `
            SELECT *, (
                SELECT id FROM images
                WHERE id > $1
                ORDER BY id ASC
                LIMIT 1
                ) AS "nextId",
                (
                SELECT id FROM images
                WHERE id < $1
                ORDER BY id DESC
                LIMIT 1
                ) AS "previousId"
            FROM images
            WHERE id = $1
        `,
        [imageId]
    );
};

module.exports.insertImage = (title, description, username, url) => {
    return db.query(
        `
            INSERT INTO images (title, description, username, url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
        [title, description, username, url]
    );
};

module.exports.selectComments = (imageId) => {
    return db.query(
        `
            SELECT * FROM comments
            WHERE image_id = $1
        `,
        [imageId]
    );
};

module.exports.insertComment = (username, commentText, imageId) => {
    return db.query(
        `
            INSERT INTO comments (username, comment_text, image_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
        [username, commentText, imageId]
    );
};
