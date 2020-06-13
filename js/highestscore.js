function getHighestScore(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var text = rawFile.responseText;
                highestScore = text;
            }
        }
    }
    rawFile.send(null);
}


function saveScore(filename,data){

}
