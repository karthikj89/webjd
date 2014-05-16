from bs4 import BeautifulSoup
import urllib2

# loop through all 1800 pages
for i in range(900,1793):
    #open the link 
    response = urllib2.urlopen('https://legaladvice.rocketlawyer.com/questions/?page=%d'%i)
    html = response.read()
    soup = BeautifulSoup(html)
    for link in soup.find_all('a'):
        if link.text=='Read more':
            print link.get('href')
