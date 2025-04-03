const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./DB/db');


require('dotenv').config();

const PORT  = process.env.DB_PORT;
const SECRET_KEY = process.env.SECRET_KEY;


const app =express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));



app.post('/api/login', (req,res) => {
    const {email, password } = req.body;

    db.query('SELECT * FROM user WHERE email = ?', [email], async(err, results) => {
        if(err){
            return res.status(505).json({error :'Database Error'});
        }
        if(results.length == 0){
            return res.status(401).json({error : 'Email ID not found'});
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password,user.password) ;
        if(!isMatch){
            return res.status(401).json({error : 'Email ID or Password is Invalid'});
        }

        const token = jwt.sign({id: user.id}, SECRET_KEY ,{expiresIn: '1h'});

        db.query('UPDATE user SET status = "Active", time = NOW() WHERE id = ?', [user.id]);
        res.json({message: 'Login Successfully', token});

    });
});


app.post('/api/register', async(req,res) => {
    const {email, password, mobileno ,name} = req.body;
    if(!name || !email || !password || !mobileno)
    {
        return res.status(400).json({error: 'All field Required'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query('INSERT INTO user (name, email, password, mobileno, status, time) VALUES (?,?,?,?,?, NOW())', 
        [name, email, hashedPassword, mobileno, "Active"],
        (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({error : 'Database Error' + err.sqlMessage});
            }
            res.status(201).json({message: `${name} registerd successfully !`});
        }
    );
});



app.get('/api/total-yojana', (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM tbl_yojana_type", (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ totalYojana: result[0].total });
    });
  });

app.get('/api/total-user', (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM user", (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ totalUser: result[0].total });
    });
  });

app.get('/api/total-category', (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM category_yojana", (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ totalCategory: result[0].total });
    });
  });

  app.get('/api/total-taluka', (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM taluka", (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ totalTaluka: result[0].total });
    });
  });

  //--------------------------------Category--------------------------------------------------------

app.get('/api/category', (req,res) => {
    db.query("SELECT * FROM category_yojana", (err,result) => {
        if(err){
            console.log("Error: ", err);
            return res.status(500).json({error:"Database Error"});
        }
        res.json(result);
    });
});


app.post("/api/new-category", (req, res) => {
    const {category_name, status} = req.body;

    if ( !category_name || !status ) {
        console.error("Validation Error: Missing fields");
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = `INSERT INTO category_yojana (category_name, status, ins_date_time, update_date_time) VALUES (?, ?, NOW(), NOW())`;
    

    db.query(sql, [category_name, status], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err);  // Debugging
            return result.status(500).json({ error: "Failed to add category", details: err.message });
        }
        res.json({ message: "Category added successfully", id: result.insertId });
    });
});


app.put("/api/category/:id", (req, res) => {
    const { id } = req.params;
    const { category_name, status } = req.body;

    const sql = `UPDATE category_yojana 
                 SET category_name = ?, status = ?, update_date_time = NOW() 
                 WHERE category_id = ?`;

    db.query(sql, [category_name, status, id], (err, result) => {
        if (err) {
            result.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Category updated successfully" });
    });
});


app.put("/api/category/deactive/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = `UPDATE category_yojana 
                 SET status = 'Deactive', update_date_time = NOW() 
                 WHERE category_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deactivating category:", err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.json({ message: "Category deactivated successfully" });
    });
});


//----------------------------------------Sub Category---------------------------------------

app.get('/api/subcategory', (req,res) => {
    db.query('SELECT * FROM sub_category ',  (err,result)=> {
        if(err){
            console.log("Error :" , err);
            return res.status(500).json({error:"Database error"});
        }
        res.json(result);
    });
});



app.post('/api/new-subcategory', (req,res)=> {
    const {subcategory_name, category_id, status} = req.body;
    const sql = `INSERT INTO sub_category (subcategory_name, category_id, status, ins_date_time, update_date_time) VALUES (?, ?, ?, NOW(), NOW())`;

    db.query(sql,[subcategory_name ,category_id, status], (err,result)=> {
        if(err){
            console.log("error:" ,err);
            return res.status(500).json({error:"Failed tp Add"});
        }
        res.status(201).json({message:`${subcategory_name} addeed successfully !`});
        
    });
});



app.put("/api/subcategory/:id", (req, res) => {
    const { subcategory_name, category_id, status } = req.body;
    const {id} = req.params;

    const sql = `UPDATE sub_category 
                 SET subcategory_name = ?, category_id = ?, status = ? , update_date_time = NOW()  
                 WHERE subcategory_id = ?`;

    db.query(sql, [subcategory_name, category_id ,status ,id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Sub category updated successfully" });
    });
});


app.put("/api/subcategory/deactive/:id", (req, res) => {
    const {id} = req.params;

    const sql = `UPDATE sub_category 
                 SET status = 'Deactive' , update_date_time = NOW()  
                 WHERE subcategory_id = ?`;

     db.query(sql, [id], (err, result) => {
                    if (err) {
                        console.error("Error deactivating Sub category:", err);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    if (result.affectedRows === 0) {
                        res.status(404).json({ message: "Sub Category not found" });
                        return;
                    }
                    res.json({ message: "Sub Category deactivated successfully" });
                });            
});


//----------------------------------------Yojana---------------------------------------------

app.get('/api/yojana', (req,res) => {
    db.query("SELECT * FROM tbl_yojana_type", (err,result) => {
        if(err){
            console.log("Error: ", err);
            return res.status(500).json({error:"Database Error"});
        }
        res.json(result);
    });
});


app.post("/api/new-yojana", (req, res) => {
    const {category_id, subcategory_id, yojana_type, amount, year, status, description, link } = req.body;

    if (!category_id || !subcategory_id || !yojana_type || !amount || !year || !status || !description || !link) {
        console.error("Validation Error: Missing fields");
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = `INSERT INTO tbl_yojana_type (category_id, subcategory_id, yojana_type, amount, yojana_year, status, description, link, ins_date_time, update_date_time) VALUES (?, ?,?,?, ?, ?, ?, NOW(), NOW())`;
    

    db.query(sql, [category_id, subcategory_id, yojana_type, amount, year, status, description, link], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err);  // Debugging
            return res.status(500).json({ error: "Failed to add yojana", details: err.message });
        }
        res.json({ message: "Yojana added successfully", id: result.insertId });
    });
});





app.put("/api/yojana/:id", (req, res) => {
    const { id } = req.params;
    const { category_id, subcategory_id, yojana_type, amount, year, status, description, link } = req.body;
   

    const sql = `UPDATE tbl_yojana_type 
                 SET category_id = ?, subcategory_id = ? , yojana_type = ?, amount = ?, yojana_year = ?,   status = ?, description = ?, link = ?, update_date_time = NOW() 
                 WHERE yojana_type_id = ?`;

    db.query(sql, [category_id, subcategory_id, yojana_type, amount, year, status, description, link, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            console.log(err);
            return;
        }
        res.json({ message: "Yojana updated successfully" });
    });
});

app.put("/api/yojana/deactive/:id", (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE tbl_yojana_type 
                 SET status = 'Deactive' , update_date_time = NOW() 
                 WHERE yojana_type_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Yojana Deactivated successfully" });
    });
});


//------------------------------------------Yojana-Vice-Document--------------------------------------------------

app.get('/api/document-yojana', (req,res) => {
    db.query("SELECT * FROM document_yojana", (err,result) => {
        if(err){
            console.log("Error: ", err);
            return res.status(500).json({error:"Database Error"});
        }
        res.json(result);
    });
});


app.get("/api/yojana-list-document", (req, res) => {
    const sql = `
        SELECT 
            dj.document_id, dj.category_id, dj.subcategory_id, dj.yojana_id, dj.status, 
            COALESCE(GROUP_CONCAT(DISTINCT dld.document_id ORDER BY dld.document_id SEPARATOR ','), '') AS documents  
        FROM document_yojana dj
        LEFT JOIN yojana_list_document dld ON dj.yojana_id = dld.yojana_id  
        GROUP BY dj.document_id, dj.category_id, dj.subcategory_id, dj.yojana_id, dj.status;
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database Error" });
        }

        // Convert documents string to array safely
        const formattedResult = result.map(row => ({
            ...row,
            documents: row.documents.trim() !== '' ? row.documents.split(",").map(Number) : []  
        }));

        res.json(formattedResult);
    });
});







app.get('/api/active-document', (req,res) => {
    db.query("SELECT * FROM document WHERE status = 'Active'", (err,result) => {
        if(err){
            console.log("Error: ", err);
            return res.status(500).json({error:"Database Error"});
        }
        res.json(result);
    });
});


app.post("/api/new-document-yojana", (req, res) => {
    const { category_id, subcategory_id, yojana_id, documents, status } = req.body;

    if (!category_id || !subcategory_id || !yojana_id || !Array.isArray(documents) || documents.length === 0 || !status) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    console.log(req.body);

    // Insert into document_yojana first
    const sql1 = `
        INSERT INTO document_yojana (category_id, subcategory_id, yojana_id, status, ins_date_time, update_date_time) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`;

    db.query(sql1, [category_id, subcategory_id, yojana_id, status], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to add Yojana" });
        }
        
        const yojanaId = result.insertId; // Get the inserted yojana_id
        console.log("Inserted yojanaId:", yojanaId);

        // Insert multiple documents into yojana_list_document
        const sql2 = `INSERT INTO yojana_list_document (yojana_id, document_id) VALUES ?`;
        const values = documents.map(doc_id => [yojanaId, doc_id]); // Array of value pairs

        db.query(sql2, [values], (err, result) => { // Pass as an array of arrays
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Failed to map Documents" });
            }
            res.json({ message: "Yojana and Documents added successfully" });
        });
    });
});



app.put("/api/document-yojana/:id", (req, res) => {
    const { id } = req.params;
    const { category_id, subcategory_id, yojana_id, documents, status } = req.body;

    if (!category_id || !subcategory_id || !yojana_id || !Array.isArray(documents) || documents.length === 0 || !status) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    // Step 1: Update document_yojana
    const sql1 = `
        UPDATE document_yojana 
        SET category_id = ?, subcategory_id = ?, yojana_id = ?, status = ?, update_date_time = NOW() 
        WHERE id = ?`;

    db.query(sql1, [category_id, subcategory_id, yojana_id, status, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update Yojana" });
        }

        // Step 2: Delete old document mappings
        const sql2 = `DELETE FROM yojana_list_document WHERE yojana_id = ?`;

        db.query(sql2, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to delete old documents" });
            }

            // Step 3: Insert new document mappings
            const sql3 = `INSERT INTO yojana_list_document (yojana_id, document_id) VALUES ?`;
            const values = documents.map(doc_id => [id, doc_id]);

            db.query(sql3, [values], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to add new documents" });
                }
                res.json({ message: "Yojana updated successfully" });
            });
        });
    });
});




app.put("/api/document-yojana/deactive/:id", (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE document_yojana 
                 SET status = 'Deactive', update_date_time = NOW() 
                 WHERE document_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            result.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Document Deactivated successfully" });
    });
});


//------------------------------------------Document-------------------------------------------------


app.get('/api/document', (req,res) => {
    db.query("SELECT * FROM document", (err,result) => {
        if(err){
            console.log("Error: ", err);
            return res.status(500).json({error:"Database Error"});
        }
        res.json(result);
    });
});


app.post("/api/new-document", (req, res) => {
    const { document_name, status} = req.body;

    if ( !document_name || !status ) {
        console.error("Validation Error: Missing fields");
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = `INSERT INTO document (document_name, status, ins_date_time, update_date_time) VALUES (?, ?, NOW(), NOW())`;
    

    db.query(sql, [document_name, status], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err);  // Debugging
            return res.status(500).json({ error: "Failed to add Document", details: err.message });
        }
        res.json({ message: "Document added successfully", id: result.insertId });
    });
});

app.put("/api/document/:id", (req, res) => {
    const { id } = req.params;
    const { document_name,status } = req.body;
   

    const sql = `UPDATE document 
                 SET  document_name = ?, status = ?, update_date_time = NOW() 
                 WHERE document_id = ?`;

    const values = [document_name, status, id]; 


    db.query(sql, [document_name,status, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Document updated successfully" });
    });
});
 


app.put("/api/document/deactive/:id", (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE document 
                 SET  status = 'Deactive' , update_date_time = NOW() 
                 WHERE document_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            result.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Document Deactivated successfully" });
    });
});




//------------------------------------------Taluka-----------------------------------------------------



app.get('/api/taluka', (req,res) => {
    db.query("SELECT * FROM taluka", (err,result) => {
        if(err){
            console.log("Error: ", err);
            return res.status(500).json({error:"Database Error"});
        }
        res.json(result);
    });
});


app.post("/api/new-taluka", (req, res) => {
    const {taluka_name_eng, taluka_name_marathi, pincode, status } = req.body;

    if (!taluka_name_eng || !taluka_name_marathi || !pincode || !status) {
        console.error("Validation Error: Missing fields");
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = `INSERT INTO taluka ( taluka_name_eng, taluka_name_marathi,  ins_date_time, update_date_time, status ,pincode) VALUES (?, ?,NOW(), NOW(), ? , ?)`;
    

    db.query(sql, [ taluka_name_eng, taluka_name_marathi, status, pincode], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err);  // Debugging
            return res.status(500).json({ error: "Failed to add yojana", details: err.message });
        }
        res.json({ message: "Taluka added successfully", id: result.insertId });
    });
});




app.put("/api/taluka/:id", (req, res) => {
    const { taluka_name_eng, taluka_name_marathi, pincode, status } = req.body;
    const { id } = req.params;

    const sql = `UPDATE taluka 
                 SET taluka_name_eng = ?, taluka_name_marathi = ? ,status = ? , pincode = ?, update_date_time = NOW()  
                 WHERE taluka_id = ?`;

    db.query(sql, [taluka_name_eng, taluka_name_marathi, status,  pincode ,id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Taluka updated successfully" });
    });
});

app.put("/api/taluka/deactive/:id", (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE taluka 
                 SET status = 'Deactive' , update_date_time = NOW()  
                 WHERE taluka_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Taluka Deactivated successfully" });
    });
});

//--------------------------------------Panchayat-----------------------------------------------

app.get('/api/panchayat', (req,res) => {
    const {taluka_id} = req.params;
    db.query('SELECT * FROM gram_panchayat ',  (err,result)=> {
        if(err){
            console.log("Error :" , err);
            return res.status(500).json({error:"Database error"});
        }
        res.json(result);
    });
});

app.get('/api/panchayat/:taluka_id', (req,res) => {
    const {taluka_id} = req.params;
    db.query(`SELECT * FROM gram_panchayat WHERE taluka_id = ?`,[taluka_id],  (err,result)=> {
        if(err){
            console.log("Error :" , err);
            return res.status(500).json({error:"Database error"});
        }
        res.json(result);
    });
});

app.post('/api/new-panchayat', (req,res)=> {
    const {panchayat_eng, panchayat_marathi, taluka_id, status} = req.body;
    const sql = `INSERT INTO gram_panchayat (panchayat_eng, panchayat_marathi, taluka_id, status, ins_date_time, update_date_time) VALUES (?, ?, ?,?, NOW(), NOW())`;

    db.query(sql,[panchayat_eng,panchayat_marathi,taluka_id, status], (err,result)=> {
        if(err){
            console.log("error:" ,err);
            return res.status(500).json({error:"Failed tp Add"});
        }
        res.status(201).json({message:`${panchayat_eng} addeed successfully !`});
        
    });
});




app.put("/api/panchayat/:id", (req, res) => {
    const { panchayat_eng, panchayat_marathi, taluka_id, status } = req.body;
    const { id } = req.params;

    const sql = `UPDATE gram_panchayat 
                 SET panchayat_eng = ?, panchayat_marathi = ?, taluka_id = ? , status = ? , update_date_time = NOW()  
                 WHERE panchayat_id = ?`;

    db.query(sql, [panchayat_eng, panchayat_marathi,taluka_id, status ,id], (err, result) => {
        if (err) {
            result.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Panchayat updated successfully" });
    });
});

app.put("/api/panchayat/deactive/:id", (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE gram_panchayat 
                 SET status = 'Deactive' , update_date_time = NOW()  
                 WHERE panchayat_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            result.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Panchayat Deactivated successfully" });
    });
});

//-----------------------------------------------Village------------------------------------------------------

app.get('/api/village/:taluka_id?/:panchayat_id?', (req, res) => {
    let { taluka_id, panchayat_id } = req.params;
    let query = `SELECT * FROM village_tbl WHERE 1=1`; // Always true to simplify conditions
    let values = [];

    if (taluka_id && taluka_id !== "All") {
        query += ` AND taluka_id = ?`;
        values.push(taluka_id);
    }

    if (panchayat_id && panchayat_id !== "All") {
        query += ` AND panchayat_id = ?`;
        values.push(panchayat_id);
    }

    db.query(query, values, (err, result) => {
        if (err) {
            console.log("Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(result);
    });
});




app.post('/api/new-village', (req,res)=> {
    const {village_eng, village_marathi,taluka_id, panchayat_id} = req.body;
    const sql = `INSERT INTO village_tbl (village_eng, village_marathi,taluka_id, panchayat_id, status, ins_date_time, update_date_time) VALUES (?, ?, ?, ?,'yes', NOW(), NOW())`;

    db.query(sql,[village_eng,village_marathi, taluka_id, panchayat_id], (err,result)=> {
        if(err){
            console.log("error:" ,err);
            return res.status(500).json({error:"Failed tp Add"});
        }
        res.status(201).json({message: `${village_eng} addeed successfully !`});
        
    });
});




app.put("/api/village/:id", (req, res) => {
    const { id } = req.params;
    const { village_eng, village_marathi} = req.body;

    const sql = `UPDATE village_tbl 
                 SET village_eng = ?, village_marathi = ?, update_date_time = NOW()  
                 WHERE village_id = ?`;

   
                 db.query(sql, [village_eng, village_marathi, id], (err, result) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ message: "Village updated successfully" });
                });
    });


app.put("/api/village/deactive/:id", (req, res) => {
        const { id } = req.params;

    
        const sql = `UPDATE village_tbl 
                     SET status = 'Deactive' ,update_date_time = NOW()  
                     WHERE village_id = ?`;
    
       
                     db.query(sql, [id], (err, result) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ message: "Village Deactivated successfully" });
                    });
        });






//----------------------------------------------User---------------------------------------
app.get('/api/user', (req,res) => {
    const {id} = req.params;
    db.query('SELECT * FROM user ',  (err,result)=> {
        if(err){
            console.log("Error :" , err);
            return res.status(500).json({error:"Database error"});
        }
        res.json(result);
    });
});


app.put("/api/user/deactive/:id", (req, res) => {
    const { id } = req.params;
    console.log(id);


    const sql = `UPDATE user 
                 SET status = 'Deactive' ,time = NOW()  
                 WHERE id = ?`;

   
                 db.query(sql, [id], (err, result) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ message: "User Deactivated successfully" });
                });
    });


app.put("/api/user/:id", (req, res) => {
        const { status } = req.body;
        const { id } = req.params;
    
        const sql = `UPDATE user
                     SET status = ? , time = NOW()  
                     WHERE id = ?`;
    
        db.query(sql, [status ,id], (err, result) => {
            if (err) {
                result.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "User updated successfully" });
        });
    });



////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------
////--------------------------------------------------------------------------------------



//-------------------------------Main website--------------------------------




// app.get("/getCategory", (req, res) => {
//     db.query("SELECT * FROM category_yojana", (err, results) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ data: results });
//     });
//   });
  
//   app.get("/getSubCategory", (req, res) => {
//     db.query("SELECT * FROM sub_category", (err, results) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ data: results });
//     });
//   });
  
//   app.get("/getYojanaType", (req, res) => {
//     db.query("SELECT * FROM tbl_yojana_type", (err, results) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ data: results });
//     });
//   });
  
//   // Submit Application Form
//   app.post(
//     "/user-apply",
//     upload.fields([
//       { name: "document1", maxCount: 1 },
//       { name: "document2", maxCount: 1 },
//       { name: "document3", maxCount: 1 },
//     ]),
//     (req, res) => {
//       const {
//         aadhar,
//         surname,
//         firstName,
//         fatherName,
//         beneficiaryType,
//         category,
//         subCategory,
//         yojnaType,
//         bankName,
//         ifsc,
//         accountNo,
//         amountPaid,
//       } = req.body;
  
//       const document1 = req.files.document1 ? req.files.document1[0].filename : null;
//       const document2 = req.files.document2 ? req.files.document2[0].filename : null;
//       const document3 = req.files.document3 ? req.files.document3[0].filename : null;
  
//       const sql =
//         "INSERT INTO applications (aadhar, surname, firstName, fatherName, beneficiaryType, category, subCategory, yojnaType, bankName, ifsc, accountNo, amountPaid, document1, document2, document3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//       const values = [
//         aadhar,
//         surname,
//         firstName,
//         fatherName,
//         beneficiaryType,
//         category,
//         subCategory,
//         yojnaType,
//         bankName,
//         ifsc,
//         accountNo,
//         amountPaid,
//         document1,
//         document2,
//         document3,
//       ];
  
//       db.query(sql, values, (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: "Application submitted successfully" });
//       });
//     }
//   );



//
// CREATE TABLE user_applied (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     aadhar VARCHAR(12) NOT NULL,
//     surname VARCHAR(100),
//     firstName VARCHAR(100),
//     fatherName VARCHAR(100),
//     beneficiaryType VARCHAR(100),
//     category VARCHAR(100),
//     subCategory VARCHAR(100),
//     yojnaType VARCHAR(100),
//     bankName VARCHAR(100),
//     ifsc VARCHAR(20),
//     accountNo VARCHAR(20),
//     amountPaid DECIMAL(10,2),
//     document1 VARCHAR(255),
//     document2 VARCHAR(255),
//     document3 VARCHAR(255),
//     submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

///---------------------------------------------------------------
///---------------------------------------------------------------
///---------------------------------------------------------------
///---------------------------------------------------------------
///---------------------------------------------------------------







app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});





