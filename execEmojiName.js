const fs = require('fs')
const path = require('path')

const emojiPath = path.join(__dirname, 'public', 'emojis')

fs.readdir(emojiPath, (err, files) => {
    if (err) {
        console.log(err)
        return
    }
    
    files.forEach((file, index) => {
        const filePath = path.join(emojiPath, file)
        const newFilePath = path.join(emojiPath, index + '.png')

        fs.rename(filePath, newFilePath, (err) => {
            if (err) {
                console.error(`rename failed: ${file}`, err);
            } else {
                console.log(`Renamed ${filePath} to ${newFilePath}`)
            }
        })
    })
})