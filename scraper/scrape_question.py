from bs4 import BeautifulSoup
import urllib2

# loop through all the questions

f = open("questions1.txt")

for line in f.readlines():
    response = urllib2.urlopen('https://legaladvice.rocketlawyer.com%s'%line)
    html = response.read()
    soup = BeautifulSoup(html)
    
    try:
        # get the question title
        title=soup.find('h1')
        question = title.text
        # get the question content and append to title
        question = question + " " + title.find_next('p').text

        # strip of all tabs
        question = question.strip().strip("\t")
    
        # get the question body
        # need to figure out how to get this
        # get the topics for the question
        topics = []
        tag = ""
        for link in soup.find_all('a'):
            if link.get("class", ['junk'])[0]=='tag':
                topics.append(link.text.strip("\t"))
                tag = link
        location = tag.find_next('strong').text
        topics = ",".join(topics)
        print "%s\t%s\t%s"%(question, topics, location)
    except:
        # scraping the site failed for some reason..
        # will need to keep track of this in the output
        print "#%s"%line
