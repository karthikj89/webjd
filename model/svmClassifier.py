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
from sklearn.externals import joblib


training_topics, training_questions, categories = [], [], {}
test_topics, test_questions = [], []

# Load in original questions data
# training questions
datafile = open('data/trainingquestions.csv')
outfile = open('data/cleaned_trainingquestions.csv', 'w')
for line in datafile.readlines()[0].splitlines():
  outfile.write("%s\n"%line)
outfile.close()

# test questions
datafile = open('data/testquestions.csv')
outfile = open('data/cleaned_testquestions.csv', 'w')
for line in datafile.readlines()[0].splitlines():
  outfile.write("%s\n"%line)
outfile.close()

# load topic file and associate numbers with the appropriate values
topicfile = open('data/label-index.txt')
topicreader = csv.reader(topicfile, delimiter=',', quotechar='"')
count = 0
for line in topicreader:
  categories[line[0]] = count
  count += 1

# read from cleaned version of training data
newdatafile = open('data/cleaned_trainingquestions.csv')
datareader = csv.reader(newdatafile, delimiter=',', quotechar='"')

questions_dict = {}
# loop through data file and parse into the components
for line in datareader:
  questionid=line[0]
  topic = line[1].split(' ')
  question = line[2]
  top = []
  for t in topic:
    if categories.get(t) is not None:
      top.append(categories.get(t))
  # add the questions into a list
  questions_dict[questionid] = top, question
  training_topics.append(top)
  training_questions.append(question)

# read from cleaned version of test data
newdatafile = open('data/cleaned_testquestions.csv')
datareader = csv.reader(newdatafile, delimiter=',', quotechar='"')

# loop through data file and parse into the components
for line in datareader:
  questionid=line[0]
  topic = line[1].split(' ')
  question = line[2]
  top = []
  for t in topic:
    if categories.get(t) is not None:
      top.append(categories.get(t))
  # add the questions into a list
  questions_dict[questionid] = top, question

# load topic distributions per training question and assign to appropriate question
datafile = open('data/document-topic-distributions.csv')
datareader = csv.reader(datafile, delimiter=',', quotechar='"')

training_distributions, training_topics, training_questions=[], [], []
test_distributions, test_topics, test_questions=[], [], []

for line in datareader:
  top, quest = questions_dict[line[0]]
  if int(line[0]) > 15000:
    test_topics.append(top)
    test_questions.append(quest)
    test_distributions.append([float(d) for d in line[1:]])
  else:
    training_distributions.append([float(d) for d in line[1:]])
    training_topics.append(top)
    training_questions.append(quest)

# Creating y_train and y_test
# these are the values that we are aiming to predict
Y = LabelBinarizer().fit(training_topics)
y_train = Y.transform(training_topics)
y_test = Y.transform(test_topics)

#X = questions
X_train = training_questions
X_test = test_questions


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

  # use topic distributions and tfidf as features
  X_train = hstack([Tfidf_train,np.array(training_distributions)])
  X_test = hstack([Tfidf_test, np.array(test_distributions)])
  
elif vectorizerOpt == 'HASHING':
  vectorizer = HashingVectorizer(stop_words='english', non_negative=True, n_features=numFeaturesHashing)
  X_train = vectorizer.transform(X_train)
  X_test = vectorizer.transform(X_test)

# Feature Selection Options
chi2FeatureSelection = True; # Set to False if you don't want chi-squared based feature selection

# If specified in options do chi-squared based feature selection
if chi2FeatureSelection == True:
    ch2 = SelectKBest(chi2, k=1000)
    X_train = ch2.fit_transform(X_train, y_train)
    X_test = ch2.transform(X_test)

# Train SVM
c_values = [.01,.05,.1,.2,.4,.5,.6,.7,.9]
exact = []
dice = []
cat_accuracy = {}

for c in c_values:
  clf = OneVsRestClassifier(LinearSVC(C=c));
  clf.fit(X_train, y_train);
  # Predict on testing set
  predictions = clf.predict(X_test);
  # You can compare *predictions to y_test* to get accuracy

  accuracy = accuracy_score(y_test, predictions);
  exact.append(accuracy)
  #print "SVM Classification Accuracy: " + str(accuracy);
  # calculate the dice accuracy
  scores = []
  for i in range(predictions.shape[0]):
    intersection = 0
    for j in range(predictions.shape[1]):
      if(predictions[i,j]==1 and y_test[i,j]==1):
        intersection+=1
    score = 0 if sum(y_test[i,:])+sum(predictions[i,:])==0 else (2.0*intersection)/(sum(y_test[i,:])+sum(predictions[i,:]))
    scores.append(score)
  dice.append(str(sum(scores)/len(scores)))

  #category specific accuracies
  for cat, val in categories.items():
    for i in range(predictions.shape[0]):
      if y_test[i,val]==1:
        intersection = 0
        for j in range(predictions.shape[1]):
          if(predictions[i,j]==1 and y_test[i,j]==1):
            intersection+=1
        score = 0 if sum(y_test[i,:])+sum(predictions[i,:])==0 else (2.0*intersection)/(sum(y_test[i,:])+sum(predictions[i,:]))
        scores.append(score)
    cat_accuracy.setdefault(cat,[]).append(str(sum(scores)/len(scores)))
print cat_accuracy
print exact
print dice

clf = OneVsRestClassifier(LinearSVC(C=.1));
clf.fit(X_train, y_train);
joblib.dump(clf, 'pickle/lawcategorizer.pkl') 
