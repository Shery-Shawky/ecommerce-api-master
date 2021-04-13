const confirmEmail = (fname, email,confirmLink)=>{
    return `
    <div style="padding:30px 0 ;font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;text-align: center; background-color:#eae3c8; color:#383e56; border-radius: 5px;">
        <p style="font-size:1.3rem; font-weight:bold">
            Welcome to <span style="font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; color: coral;">Amnesia</span> 
        </p>
        <hr style="width:50%;"/>
        <h3 style="text-align: left; padding-left: 50px; margin-bottom: 2rem;">Hi, ${fname}</h3>
        <div style="font-size: 1rem; padding-left: 50px; padding-bottom:20px; text-align: left;">
            <p>Thank you so much for joining our community.  &#128079; &#128170;<br><br> You have registered with email address: <b><i>${email}</i></b></p>
            <p>Only one step is needed. To complete the registeration, kindly press on button 'Verify me': </p>
        </div>
        <p style="text-align: center;"><a style="display: inline-block; padding:10px;background-color:coral; color:white;text-decoration: none;cursor: pointer;box-shadow: 0 0 8px gray;" href="${confirmLink}">Verify me</a></p>
    </div>
    `
};

module.exports = confirmEmail;