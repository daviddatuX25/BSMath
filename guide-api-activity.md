CCSIT 213 UI/UX Principles Page **1** of **4** 

**Worksheet 4.2 Client-Side Website with API Integration**   
**Overview**   
In this activity, you will develop the **client-side version of your course website**. Data will be retrieved from your **database using an API (JSON format)** and displayed on your  website based on your **Worksheet 1.2 Course Website design**. 

**A. Content Requirements**   
All features from your **Use Case Diagram** must appear on the website **EXCEPT**:  Login 

 Manage Users 

 Approve Content 

 Include: 

• Programs   
• Announcements   
• Events   
• News   
• Gallery   
• Faculty 

**B. Development Instructions (API \+ Client Side).** This is an example, you can add fields based  on your needs, just like **links** for your images that will appear in your website. **Step 1: Create Database (MySQL)**   
CREATE DATABASE course\_website; 

USE course\_website; 

CREATE TABLE programs (   
 id INT AUTO\_INCREMENT PRIMARY KEY,   
 name VARCHAR(100),   
 description TEXT   
); 

CREATE TABLE announcements (   
 id INT AUTO\_INCREMENT PRIMARY KEY,   
 title VARCHAR(100),   
 content TEXT,   
 date\_posted DATE   
); 

**Step 2: Create API (PHP \+ JSON)** 

 **programs\_api.php**   
\<?php   
header("Content-Type: application/json"); 

$conn \= new mysqli("localhost", "root", "", "course\_website"); $result \= $conn-\>query("SELECT \* FROM programs"); 

$data \= array(); 

while($row \= $result-\>fetch\_assoc()) {   
 $data\[\] \= $row;   
}

Bachelor of Science in Information Technology   
CCSIT 213 UI/UX Principles Page **2** of **4** 

echo json\_encode($data);   
?\> 

 **announcements\_api.php**   
\<?php   
header("Content-Type: application/json"); 

$conn \= new mysqli("localhost", "root", "", "course\_website"); $result \= $conn-\>query("SELECT \* FROM announcements"); $data \= array(); 

while($row \= $result-\>fetch\_assoc()) {   
 $data\[\] \= $row;   
} 

echo json\_encode($data);   
?\> 

**Step 3: Client-Side (HTML \+ JavaScript Fetch API)** 

 **index.html**   
\<\!DOCTYPE html\>   
\<html\>   
\<head\>   
 \<title\>Course Website\</title\>   
\</head\>   
\<body\> 

\<h1\>Programs\</h1\>   
\<div id="programs"\>\</div\> 

\<h1\>Announcements\</h1\>   
\<div id="announcements"\>\</div\> 

\<script\>   
// Fetch Programs   
fetch('http://localhost/programs\_api.php')   
.then(response \=\> response.json())   
.then(data \=\> {   
 let output \= "";   
 data.forEach(program \=\> {   
 output \+=    
\`\<h3\>${program.name}\</h3\>\<p\>${program.description}\</p\>\`;  }); 

 document.getElementById("programs").innerHTML \= output; }); 

// Fetch Announcements   
fetch('http://localhost/announcements\_api.php') .then(response \=\> response.json()) 

.then(data \=\> {   
 let output \= "";   
 data.forEach(item \=\> {

Bachelor of Science in Information Technology   
CCSIT 213 UI/UX Principles Page **3** of **4**   
 output \+= \`\<h3\>${item.title}\</h3\>\<p\>${item.content}\</p\>\`;  }); 

 document.getElementById("announcements").innerHTML \= output; }); 

\</script\> 

\</body\>   
\</html\> 

**Step 4: (Optional) React Version**   
If using React:   
import { useEffect, useState } from "react"; 

function Programs() {   
 const \[programs, setPrograms\] \= useState(\[\]); 

 useEffect(() \=\> {   
 fetch("http://localhost/programs\_api.php")   
 .then(res \=\> res.json())   
 .then(data \=\> setPrograms(data));   
 }, \[\]); 

 return (   
 \<div\>   
 \<h1\>Programs\</h1\>   
 {programs.map(p \=\> (   
 \<div key={p.id}\>   
 \<h3\>{p.name}\</h3\>   
 \<p\>{p.description}\</p\>   
 \</div\>   
 ))}   
 \</div\>   
 );   
} 

export default Programs; 

**C. UI/UX Requirements**   
• Follow your **Worksheet 1.2 Course Website design**   
• Apply your **assigned color scheme**   
• Ensure:   
o Readability   
o Proper spacing   
o Clear navigation 

**D. Submission**   
• Source Code (ZIP file)   
• Running demo during presentation   
• Print the rubric on page 4 and submit during demo 

**Important Notes**   
✔ Use **API (JSON)** for data retrieval 

✔ Do NOT hardcode data 

✔ Follow proper **UI/UX principles** 

✔ Ensure the system is **functional and organized**

Bachelor of Science in Information Technology   
CCSIT 213 UI/UX Principles Page **4** of **4** 

**Worksheet 4.2 Client-Side Website with API Integration** 

 **Total: 80 Points** 

| Criteria  | Excellent  | Very Good  | Needs Improvement |
| :---- | :---- | :---- | :---- |
| **Content (20 pts)**  | **20–16 pts** – All   required contents are  present and properly  displayed in the   website. | **15–11 pts** – 1–3   contents are missing or  incomplete. | **10–5 pts** – 3 or more  contents are missing or  not properly displayed. |
| **Working API (40  pts)** | **40–31 pts** – All data  are correctly fetched  from the API; no   hardcoded data;   smooth and error-free  integration. | **30–21 pts** – Most data  are fetched from API;  minor errors or some  data partially   hardcoded. | **20–10 pts** – API is not  properly working; major  errors; mostly   hardcoded or missing  data integration. |
| **Responsiveness  & Design (20 pts)** | **20–16 pts** – Fully   responsive; clean,  modern design;   consistent with   assigned color   scheme; excellent  UI/UX. | **15–11 pts** – Mostly  responsive; acceptable  design; minor   inconsistencies in   layout or colors. | **10–5 pts** – Not   responsive; poor   layout; inconsistent  design; difficult to use. |

 **Q\&A and Submission Rubric (20 Points)** 

| Criteria  | 10 pts  | 5 pts  | 1 pt |
| :---- | :---- | :---- | :---- |
| **Understanding and  Response to   Questions** | Answers are clear, accurate,  and show strong   understanding of the project  and concepts. | Answers are   partially correct  but lack clarity or  depth. | Answers are   incorrect, unclear,  or unable to   respond. |
| **Submission**  | Submitted before due date. |  |  |

Names: Score: Section: **BSIT-3\_\_\_\_** 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ \_\_\_\_\_\_\_\_\_\_ 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ \_\_\_\_\_\_\_\_\_\_ 

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ \_\_\_\_\_\_\_\_\_\_

Bachelor of Science in Information Technology 