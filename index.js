const express = require('express')
const axios = require('axios')
const cors = require('cors');
const { JSDOM } = require('jsdom');


const baseUrl = process.env.URL || `http://secondary2022.moed.gov.sy`;



const app = express()

app.use(
	cors(),
    express.json()
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(
	`Server started on port ${PORT}`));

app.get('/',(req,res)=>{
    res.send("Ok")
})


app.post('/num', async (req, res) => {
	const num = req.body.num;
	const city = req.body.city;
    const category =  req.body.category;
    const sub =  req.body.sub || '';
    const halfurl =  req.body.halfurl || '';
console.log(num,city,category,sub,halfurl)
console.log(req.body)
try{
	const data = await resultNum(num,city,category,sub,halfurl)
	res.json({"marks" : data[0], "user" : data[1]})
}catch(err){
	res.json({"Error" : err.message});
}
})



app.post('/name', async (req, res) => {
	const name = req.body.name;
	const father = req.body.father;
	const lastname = req.body.lastname;
	const city = req.body.city;
    const category =  req.body.category;
    const sub =  req.body.sub || '';
    const halfurl =  req.body.halfurl || '';

try{
	const data = await resultName(name,father,lastname,city,category,sub,halfurl)
	res.json({"names" : data[0], "status" : data[1],"link": data[2] || '',"back": data[3] || ''})
}catch(err){
	res.json({"Error" : err.message});
}
})

app.post('/city' , async (req,res)=>{
	const city = req.body.city;
    const category =  req.body.category;
    const sub =  req.body.sub || '';

	try{
		const data = await resultCity(city,category,sub)
		res.json({"names" : data})
	}catch(err){
		res.json({"Error" : err.message});
	}
})

app.post('/schools' , async (req,res)=>{
	const school = req.body.school;
	const city = req.body.city;
    const category =  req.body.category;
    const sub =  req.body.sub || '';
    const halfurl =  req.body.halfurl || '';

	try{
		const data = await resultSchools(school,city,category,sub,halfurl)
		res.json({"names" : data[0], "link" : data[1],"back": data[2] || '',"category": data[3] || '',"sub": data[4] || ''})
	}catch(err){
		res.json({"Error" : err.message});
	}
})

app.post('/school' , async (req,res)=>{
    const category =  req.body.category;
    const sub =  req.body.sub || '';
    const halfurl =  req.body.halfurl || '';

	try{
		const data = await resultSchool(category,sub,halfurl)
		res.json({"names" : data})
	}catch(err){
		res.json({"Error" : err.message});
	}
})


app.post('/syria' , async (req,res)=>{
    const category =  req.body.category;
    const sub =  req.body.sub || '';

	try{
		const data = await resultSyria(category,sub)
		res.json({"names" : data})
	}catch(err){
		res.json({"Error" : err.message});
	}
})

app.get('/req' , async (req,res)=>{
	
const url = "https://2000-01hzkq91ad81aw7qbwnsgv5z49.cloudspaces.litng.ai/";
const duration = 5000; // Test duration in milliseconds
const concurrency = 1000; // Number of concurrent requests

let requestsSent = 0;
let responsesReceived = 0;

async function sendRequest() {
  requestsSent++;
  try {
    const response = await axios.get(url);
    const text = await response.data; // Consume the body
    console.log(text);
    responsesReceived++;
  } catch (error) {
    console.error("Error:" + error);
  }
}

const startTime = Date.now();

async function runTest() {
  if (Date.now() - startTime < duration) {
    const requests = Array(concurrency)
      .fill()
      .map(() => sendRequest());
    await Promise.all(requests);
    setImmediate(runTest);
  } else {
    const totalTime = (Date.now() - startTime) / 1000;
    const rps = responsesReceived / totalTime;
    console.log(`Requests sent: ${requestsSent}`);
    console.log(`Responses received: ${responsesReceived}`);
    console.log(`Test duration: ${totalTime} seconds`);
    console.log(`Requests per second: ${rps.toFixed(2)}`);
  }
}

  runTest();
})


// Number
const resultNum = async (num,city,category,sub='',halfurl='')=>{
    console.log(num,city,category,sub,halfurl)
    const FIcategory = sub  != '' ? sub+'/'  : ''
    console.log(halfurl)
	const url =  halfurl != '' ?`${baseUrl}/${category}/${FIcategory}${halfurl}` :`${baseUrl}/${category}/${FIcategory}result.php?city=${city}&stdnum=${num}`
    console.log(url)
	const data = await axios.get(url);
	const html = data.data

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const subjects = document.querySelectorAll('.mark-table .a-cell .subject ');
	const marks = document.querySelectorAll('.mark-table .a-cell .mark ');
	const marksUp = document.querySelectorAll('.mark-table .a-cell div:last-child div:last-child  ');
	const marksDown = document.querySelectorAll('.mark-table .a-cell div:last-child div:first-child  ');
	const user = document.querySelectorAll('.user-row .user-info .a-cell ');


	const results =[];
	let result ={};
	const student ={};

	for (let i = 0; i < marks.length ; i++) {
		result = {name: subjects[i].textContent.trim(), mark : marks[i].textContent,up:marksUp[i].textContent.trim() , down:marksDown[i].textContent.trim()};	
        results.push(result)
	}
	user.forEach((u , i)=>{
		if(u.textContent.includes('الاسم')){
			student["الاسم"] = user[i+1].textContent	
		}
		if(u.textContent.includes('أم')){
			student["الأم"] = user[i+1].textContent	
		}
		if(u.textContent.includes('مدرس')){
			student["المدرسة"] = user[i+1].textContent	
		}
		if(u.textContent.includes('نتيجة')){
			student["النتيجة"] = user[i+1].textContent	
		}
	})

	return [results , student];
	
}

// Name
const resultName = async (name,father,lastname,city,category,sub='',halfnameurl='')=>{
    const FIcategory = sub  != '' ? '/'+sub  : ''
    const urlEnd = sub != '' ? 'name_r' : 'resultname'

	const url = halfnameurl != '' ? sub != '' ? `${baseUrl}/${category}${FIcategory}/${urlEnd}.php${halfnameurl}`: `${baseUrl}${FIcategory}${halfnameurl}` : `${baseUrl}/${category}${FIcategory}/${urlEnd}.php?city=${city}&name=${name}&father=${father}&lastname=${lastname}`
    console.log(url)
	const data = await axios.get(url);
	const html = data.data

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const card = document.querySelectorAll('.results-t');
	const pager = document.querySelectorAll('.pager a');
	
	let nameInfo ={};
	const namesInfo =[];
    let pagerStatus = false;
    let pagerLink = '';
    let pagerBack = '';

    for (let i = 0; i < card.length; i++) {
        nameInfo ={}
        let titles = card[i].querySelectorAll('.results-t div div > span:first-child');
        let values = card[i].querySelectorAll('.results-t div div');
		for (let j = 0; j < titles.length ; j++) {
            const title = titles[j].textContent
            const val = values[j].textContent.slice(title.length)
            nameInfo[title.trim()] = val.trim();	

        }
        const a = card[i].querySelector('.results-t div div > a');
        nameInfo['halfurl'] = a.href;	
        namesInfo.push(nameInfo)
	}
    if(pager.length > 0 ){
        pager.forEach(link =>{
            if(link.textContent == "الصفحة التالية"){
                pagerStatus = true;
                pagerLink = link.href
                console.log(pagerLink)
            }
			if(link.textContent == "الصفحة السابقة"){
                pagerStatus = true;
                pagerBack = link.href
                console.log(pagerLink)
            }
        })
    }
    return [namesInfo,pagerStatus,pagerLink,pagerBack]
	
}


// City
const resultCity = async (city,category,sub='')=>{
    const FIcategory = sub  != '' ? '/'+sub  : ''
    const urlEnd = sub != '' ? 'topdire10_r' : 'top10dirResults'

	const url =  `${baseUrl}/${category}${FIcategory}/${urlEnd}.php?city=${city}}`
    console.log(url)
	const data = await axios.get(url);
	const html = data.data

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const card = document.querySelectorAll('.results-t');
	
	let nameInfo ={};
	const namesInfo =[];

    for (let i = 0; i < card.length; i++) {
        nameInfo ={}
        let titles = card[i].querySelectorAll('.results-t div div > span:first-child');
        let values = card[i].querySelectorAll('.results-t div div');
		for (let j = 0; j < titles.length ; j++) {
            const title = titles[j].textContent
            const val = values[j].textContent.slice(title.length)
            nameInfo[title.trim()] = val.trim();	

        }
        const a = card[i].querySelector('.results-t div div > a');
        nameInfo['halfurl'] = a.href;	
        namesInfo.push(nameInfo)
	}

    return namesInfo
	
}


const resultSchool = async (category,sub,halfnameurl='')=>{
    const FIcategory = sub  != '' ? '/'+sub  : ''
	const url = sub != '' ? `${baseUrl}/${category}${FIcategory}/${halfnameurl}`: `${baseUrl}/${category}/${FIcategory}${halfnameurl}`
    console.log(url)
	const data = await axios.get(url);
	const html = data.data

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const card = document.querySelectorAll('.results-t');
	
	let nameInfo ={};
	const namesInfo =[];


    for (let i = 0; i < card.length; i++) {
        nameInfo ={}
        let titles = card[i].querySelectorAll('.results-t div div > span:first-child');
        let values = card[i].querySelectorAll('.results-t div div');
		for (let j = 0; j < titles.length ; j++) {
            const title = titles[j].textContent
            const val = values[j].textContent.slice(title.length)
            nameInfo[title.trim()] = val.trim();	

        }
        const a = card[i].querySelector('.results-t div div > a');
        nameInfo['halfurl'] = a.href;	
        namesInfo.push(nameInfo)
	}

    return namesInfo
	
}

const resultSchools = async (school,city,category,sub='',halfnameurl='')=>{
    const FIcategory = sub  != '' ? '/'+sub  : ''
    const urlEnd = sub != '' ? 'schools_r' : 'schools'

	const url = halfnameurl != '' ? sub != '' ? `${baseUrl}/${category}${FIcategory}/${urlEnd}.php${halfnameurl}`: `${baseUrl}${FIcategory}${halfnameurl}` : `${baseUrl}/${category}${FIcategory}/${urlEnd}.php?city=${city}&school=${school}`
    console.log(url)
	const data = await axios.get(url);
	const html = data.data

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const card = document.querySelectorAll('.results-t');
	const pager = document.querySelectorAll('.pager a');
	
	let nameInfo ={};
	const namesInfo =[];
    let pagerLink = '';
	let pagerBack = '';

    for (let i = 0; i < card.length; i++) {
        nameInfo ={}
        let titles = card[i].querySelectorAll('.results-t div div > span:first-child');
        let values = card[i].querySelectorAll('.results-t div div');
		for (let j = 0; j < titles.length ; j++) {
            const title = titles[j].textContent
            const val = values[j].textContent.slice(title.length)
            nameInfo[title.trim()] = val.trim();	

        }
        const a = card[i].querySelector('.results-t div div > a');
        nameInfo['halfurl'] = a.href;	
        namesInfo.push(nameInfo)
	}
    if(pager.length > 0 ){
        pager.forEach(link =>{
            if(link.textContent == "الصفحة التالية"){
                pagerLink = link.href
                console.log(pagerLink)
            }
			if(link.textContent == "الصفحة السابقة"){
                pagerBack = link.href
                console.log(pagerLink)
            }
        })
    }
    return [namesInfo,pagerLink,pagerBack,category,sub]
	
}

const resultSyria = async (category,sub='')=>{
    const FIcategory = sub  != '' ? '/'+sub  : ''
    const urlEnd = sub != '' ? 'topcou10_r' : 'top10CouResults'

	const url = `${baseUrl}/${category}${FIcategory}/${urlEnd}.php`
    console.log(url)
	const data = await axios.get(url);
	const html = data.data

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const card = document.querySelectorAll('.results-t');
	
	let nameInfo ={};
	const namesInfo =[];


    for (let i = 0; i < card.length; i++) {
        nameInfo ={}
        let titles = card[i].querySelectorAll('.results-t div div > span:first-child');
        let values = card[i].querySelectorAll('.results-t div div');
		for (let j = 0; j < titles.length ; j++) {
            const title = titles[j].textContent
            const val = values[j].textContent.slice(title.length)
            nameInfo[title.trim()] = val.trim();	

        }
        const a = card[i].querySelector('.results-t div div > a');
        nameInfo['halfurl'] = a.href;	
        namesInfo.push(nameInfo)
	}
    
    return namesInfo
	
}
