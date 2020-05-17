let apiBaseURL = 'http://ec2-34-245-97-253.eu-west-1.compute.amazonaws.com:3000';
if(window.location.hostname != 'ec2-34-245-97-253.eu-west-1.compute.amazonaws.com')
    apiBaseURL = 'http://172.24.4.137:3030';

$("#gLoginBtn").click(function(e) {
    e.preventDefault();

    let w = 500;
    let h = 400;
    let left = (screen.width/2)-(w/2);
    let top = (screen.height/2)-(h/2);

    //open new popup window in the centre of the screen
    let loginWindow = window.open(apiBaseURL+'/auth/google', 'newwindow', 'width=' + w + ', height = ' + h + ',left = ' + left + ',top = ' + top);
    let loginSuccess = false;

    setInterval(()=>{//check every 200ms if the token exist and in that case close the popup window
        $.each(document.cookie.split(/; */), function()  {
            let splitCookie = this.split('=');
            if(splitCookie[0] === 'gToken' && !loginSuccess){
                loginSuccess = true;
                loginWindow.close();
                window.location.replace(apiBaseURL);
            }
        });
    }, 200);
});

$("#sLoginBtn").click(function(e) {
    e.preventDefault();

    let w = 500;
    let h = 400;
    let left = (screen.width/2)-(w/2);
    let top = (screen.height/2)-(h/2);

    //open new popup window in the centre of the screen
    let loginWindow = window.open(apiBaseURL+'/auth/steam', 'newwindow', 'width=' + w + ', height = ' + h + ',left = ' + left + ',top = ' + top);
    let loginSuccess = false;

    setInterval(()=>{//check every 200ms if the token exist and in that case close the popup window
        $.each(document.cookie.split(/; */), function()  {
            let splitCookie = this.split('=');
            if(splitCookie[0] === 'sToken' && !loginSuccess){
                loginSuccess = true;
                loginWindow.close();
                window.location.replace(apiBaseURL);
            }
        });
    }, 200);
});
