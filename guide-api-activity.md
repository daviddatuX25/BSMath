# [cite_start]CCSIT 213 UI/UX Principles [cite: 1]
## [cite_start]Worksheet 4.2 Client-Side Website with API Integration [cite: 1]

### [cite_start]Overview [cite: 2]
[cite_start]In this activity, you will develop the client-side version of your course website. [cite: 4] [cite_start]Data will be retrieved from your database using an API (JSON format) and displayed on your website based on your Worksheet 1.2 Course Website design. [cite: 5]

---

### [cite_start]A. Content Requirements [cite: 6]
[cite_start]All features from your Use Case Diagram must appear on the website EXCEPT: [cite: 7]
* [cite_start]X Login [cite: 8]
* [cite_start]X Manage Users [cite: 9]
* [cite_start]X Approve Content [cite: 10]

[cite_start]☑ Include: [cite: 11]
* [cite_start]Programs [cite: 12]
* [cite_start]Announcements [cite: 13]
* [cite_start]Events [cite: 14]
* [cite_start]News [cite: 15]
* [cite_start]Gallery [cite: 16]
* [cite_start]Faculty [cite: 17]

---

### [cite_start]B. Development Instructions (API + Client Side) [cite: 18]
[cite_start]This is an example, you can add fields based on your needs, just like links for your images that will appear in your website. [cite: 18, 19]

[cite_start]**Step 1: Create Database (MySQL)** [cite: 20]
[cite_start]The database and tables can be created using the following queries[cite: 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]:
```sql
CREATE DATABASE course_website;
USE course_website;

CREATE TABLE programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT
);

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    content TEXT,
    date_posted DATE
);
```

[cite_start]**Step 2: Create API (PHP + JSON)** [cite: 34]

[cite_start]`programs_api.php`[cite: 35]:
```php
<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "course_website");
$result = $conn->query("SELECT * FROM programs");
$data = array();
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>
```
[cite_start]*[cite: 36, 37, 38, 39, 40, 41, 42, 43, 46]*

[cite_start]`announcements_api.php`[cite: 47]:
```php
<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "course_website");
$result = $conn->query("SELECT * FROM announcements");
$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>
```
[cite_start]*[cite: 48, 49, 51, 52, 53, 54, 55, 56, 57, 58]*

[cite_start]**Step 3: Client-Side (HTML + JavaScript Fetch API)** [cite: 59]

[cite_start]`index.html`[cite: 59]:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Course Website</title>
</head>
<body>
    <h1>Programs</h1>
    <div id="programs"></div>
    <h1>Announcements</h1>
    <div id="announcements"></div>

    <script>
        // Fetch Programs
        fetch('http://localhost/programs_api.php')
            .then(response => response.json())
            .then(data => {
                let output = "";
                data.forEach(program => {
                    output += `<h3>${program.name}</h3><p>${program.description}</p>`;
                });
                document.getElementById("programs").innerHTML = output;
            });

        // Fetch Announcements
        fetch('http://localhost/announcements_api.php')
            .then(response => response.json())
            .then(data => {
                let output = "";
                data.forEach(item => {
                    output += `<h3>${item.title}</h3><p>${item.content}</p>`;
                });
                document.getElementById("announcements").innerHTML = output;
            });
    </script>
</body>
</html>
```
[cite_start]*[cite: 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 90, 91, 92, 93, 94, 95, 96]*

[cite_start]**Step 4: (Optional) React Version** [cite: 97]
[cite_start]If using React[cite: 98]:
```jsx
import { useEffect, useState } from "react";

function Programs() {
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        fetch("http://localhost/programs_api.php")
            .then(res => res.json())
            .then(data => setPrograms(data));
    }, []);

    return (
        <div>
            <h1>Programs</h1>
            {programs.map(p => (
                <div key={p.id}>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                </div>
            ))}
        </div>
    );
}
export default Programs;
```
[cite_start]*[cite: 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]*

---

### [cite_start]C. UI/UX Requirements [cite: 119]
* [cite_start]Follow your Worksheet 1.2 Course Website design [cite: 120]
* [cite_start]Apply your assigned color scheme [cite: 121]
* [cite_start]Ensure: [cite: 122]
    * [cite_start]Readability [cite: 123]
    * [cite_start]Proper spacing [cite: 124]
    * [cite_start]Clear navigation [cite: 126]

---

### [cite_start]D. Submission [cite: 127]
* [cite_start]Source Code (ZIP file) [cite: 128]
* [cite_start]Running demo during presentation [cite: 129]
* [cite_start]Print the rubric on page 4 and submit during demo [cite: 130]

[cite_start]**Important Notes** [cite: 131]
* [cite_start]✓ Use API (JSON) for data retrieval [cite: 132]
* [cite_start]Do NOT hardcode data [cite: 133]
* [cite_start]Follow proper UI/UX principles [cite: 134]
* [cite_start]✓ Ensure the system is functional and organized [cite: 135]

---

### [cite_start]Rubrics [cite: 138]

[cite_start]**Total: 80 Points** [cite: 139]

| Criteria | Excellent | Very Good | Needs Improvement |
| :--- | :--- | :--- | :--- |
| **Content (20 pts)** | 20-16 pts - All required contents are present and properly displayed in the website. | 15-11 pts - 1-3 contents are missing or incomplete. | 10-5 pts - 3 or more contents are missing or not properly displayed. |
| **Working API (40 pts)** | 40-31 pts - All data are correctly fetched from the API; no hardcoded data; smooth and error-free integration. | 30-21 pts - Most data are fetched from API; minor errors or some data partially hardcoded. | 20-10 pts - API is not properly working; major errors; mostly hardcoded or missing data integration. |
| **Responsiveness & Design (20 pts)** | 20-16 pts - Fully responsive; clean, modern design; consistent with assigned color scheme; excellent UI/UX. | 15-11 pts - Mostly responsive; acceptable design; minor inconsistencies in layout or colors. | 10-5 pts - Not responsive; poor layout; inconsistent design; difficult to use. |
[cite_start]*[cite: 139]*

[cite_start]**Q&A and Submission Rubric (20 Points)** [cite: 141]

| Criteria | 10 pts | 5 pts | 1 pt |
| :--- | :--- | :--- | :--- |
| **Understanding and Response to Questions** | Answers are clear, accurate, and show strong understanding of the project and concepts. | Answers are partially correct but lack clarity or depth. | Answers are incorrect, unclear, or unable to respond. |
| **Submission** | Submitted before due date. | | |
[cite_start]*[cite: 142]*

---

[cite_start]**Names:** __________________________________ [cite: 143]  
[cite_start]**Score:** ___________________________________ [cite: 144]  
[cite_start]**Section:** BSIT-3 [cite: 145]