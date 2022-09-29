const axios = require("axios")
const {
    MongoClient
} = require('mongodb');
const fs = require('fs')
var wbhook = "webhook url"
var mongolink = "insert mongodb link"
const { JSDOM } = require("jsdom");

var client = new MongoClient(mongolink);
var db = client.db('data');
var collection = db.collection('link');

async function RandomCharacter() {
    let list = []
    for (let i = 0; i < 4; i++) {
        var uppalphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        var num = Math.floor(Math.random() * uppalphabet.length);
        list.push(uppalphabet[num])
    }
    return list.join("")
}

async function Get(url) {
    return axios.get(url).then(response => response.request._header).catch(error => "There is no file")
}
async function GetData(url) {
    return axios.get(url).then(response => response.data).catch(error => "There is no file")
}

async function MongoLogger(data) {
    var result = await collection.find({
        "Link": data
    }).toArray().then(result => result[0])
    var html = new JSDOM(await GetData(data)).window.document.getElementsByClassName("heading-1")[0].innerHTML.split(" indir").join("")
    if (result == undefined) {
        console.log("This link is not in the database")
        await collection.insertOne({
            "Link": data,
            "Text": html
        })
        return 1
    } else {
        await collection.updateOne({ "_id": result._id }, {$set: {"Text": html}})
        console.log("This link is already in the database")
        return 0
    }
}

async function WebhookSender(content) {
    await axios.post(wbhook, {
            username: "SikimKocaman",
            content: content,
            avatar_url: "https://cdn.agalarhack.ml/sahtekiz.png"
        })
        .then(function (response) {
            console.log("Webhook Succesfully Sended!")
        })
        .catch(function (error) {
            console.log("A error occurred while sending webhook.");
        });
}

async function Main() {
    for (var i = 0; i < 99999999999; i++) {
        var data = "https://www.dosyaupload.com/" + await RandomCharacter()
        const txtdeneme = ('\n' + data)
        await Get(data).then(async function (response) {
            if (response.includes("GET /error.html?e=Dosya+silindi. HTTP/1.1") || response == "There is no file") {} else {
                console.log("There is a file " + data + " repeat time:" + i)
                var result = await MongoLogger(data)
                if (result == 1) {
                    WebhookSender("There is a file " + data)
                    fs.writeFile('./test.txt', txtdeneme, {
                        flag: 'a+'
                    }, err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    })
                }
            }
        })
        data = ""
    }
}

Main()
