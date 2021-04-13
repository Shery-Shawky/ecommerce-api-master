const contactUsEmail = (fullname, message,email,phone )=>{
    return `
    <div style="padding:30px 0 ;font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;text-align: center; background-color:#eae3c8; color:#383e56; border-radius: 5px;">
        <p style="font-size:1.3rem; font-weight:bold">
            Message to <span style="font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; color: coral;">Amnesia</span> 
        </p>
        <hr style="width:50%;"/>
        <h3 style="text-align: left; padding-left: 50px; margin-bottom: 2rem;">Message from: ${fullname}</h3>
        <div style="font-size: 1rem; padding-left: 50px; padding-bottom:20px; text-align: left;">
            <p>${message}</p>
            <p>message recieved from: ${email}</p>
            <p>phone number: ${phone}</p>
        </div>
    </div>
    `
};

module.exports = contactUsEmail;