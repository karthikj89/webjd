import numpy as np
import sys
from sklearn.feature_extraction.text import TfidfVectorizer, HashingVectorizer, CountVectorizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.svm import SVC, LinearSVC
from sklearn.linear_model import RidgeClassifierCV
from sklearn import metrics
from sklearn.preprocessing import LabelBinarizer
from sklearn.metrics import accuracy_score
from scipy.sparse import coo_matrix, hstack
import csv


# Load in data
datafile = open('data/rocketquestionsdata.csv')
datareader = csv.reader(datafile, delimiter=',', quotechar='"')
topics, questions, categories = [], [], {}
count = 1

# loop through data file and parse into the components
for line in datareader:
  questionid=line[0]
  topic = line[1].split(' ')
  question = line[2]
  
  # turn the topics into integers
  for t in topic:
    if t not in categories:
      categories[t] = str(count)
      count = count + 1
  topic = [categories[t] for t in topic]
  topics.append(topic)
  # add the questions into a list
  questions.append(question)

# Creating y_train and y_test
# these are the values that we are aiming to predict
Y = LabelBinarizer().fit(topics).transform(topics);
y_train = Y[1:3500];
y_test = Y[3500:];

X = questions
X_train = X[1:3500]
X_test = X[3500:]


# Extract features from dataset using powerful TFIDF or Hashing vectorizer
# Currently TFIDF and Hashing vectorizers are one of the best feature 
# extraction methods for text classification - far superior to bag of words

vectorizerOpt = 'BagOfWords'; #Change to 'HASHING' if you want to use other feature extractor
numFeaturesHashing = 10000; #If you use Hashing Vectorizer then you can play with this parameter
# on how many features to extract (this isnt necessary for TFIDF)

if vectorizerOpt == 'BagOfWords':
  vectorizer = CountVectorizer(stop_words='english')
  BOW_train = vectorizer.fit_transform(X_train)
  BOW_test = vectorizer.transform(X_test)

  vectorizer = TfidfVectorizer(stop_words='english')
  Tfidf_train = vectorizer.fit_transform(X_train)
  Tfidf_test = vectorizer.transform(X_test)
  
  X_train = hstack([BOW_train,Tfidf_train])
  X_test = hstack([BOW_test,Tfidf_test])
elif vectorizerOpt == 'HASHING':
  vectorizer = HashingVectorizer(stop_words='english', non_negative=True, n_features=numFeaturesHashing)
  X_train = vectorizer.transform(X_train)
  X_test = vectorizer.transform(X_test)

# Feature Selection Options
chi2FeatureSelection = False; # Set to False if you don't want chi-squared based feature selection

# If specified in options do chi-squared based feature selection
if chi2FeatureSelection == True:
    ch2 = SelectKBest(chi2, k=100)
    X_train = ch2.fit_transform(X_train, y_train)
    X_test = ch2.transform(X_test)

# Train SVM
clf = OneVsRestClassifier(LinearSVC(C=.05));
clf.fit(X_train, y_train);
# Predict on testing set
predictions = clf.predict(X_test);
# You can compare *predictions to y_test* to get accuracy

accuracy = accuracy_score(y_test, predictions);
print "SVM Classification Accuracy: " + str(accuracy);

              
