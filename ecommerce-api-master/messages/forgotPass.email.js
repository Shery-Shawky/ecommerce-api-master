const forgetPassEmail = (firstname,forgetPassword) =>{
    return`
    <div style="padding:30px 0 ;font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;text-align: center; background-color:#eae3c8; color:#383e56; border-radius: 5px;">
        <p style="font-size:1.3rem; font-weight:bold">
            Welcome to <span style="font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; color: coral;">Amnesia</span> 
        </p>
        <hr style="width:50%;"/>
        <h3 style="text-align: left; padding-left: 50px; margin-bottom: 2rem;">Hi, ${firstname}</h3>
        <div style="font-size: 1rem; padding-left: 50px; padding-bottom:20px; text-align: left;">
            <p>
                A password reset event has been triggered. The password reset window is limited to two hours. If you do not reset your password within two hours, you will need to submit a new request. To complete the password reset process, visit the following link:
            </p>
        </div>
        <p style="text-align: center;">
            <a style="display: inline-block; padding:10px;background-color:green; color:white;text-decoration: none;cursor: pointer;box-shadow: 0 0 8px gray;" href="${forgetPassword}">Reset password</a>
        </p>
    </div>
    `
}
module.exports = forgetPassEmail;