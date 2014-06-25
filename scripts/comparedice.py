import csv
f = open('/Users/karthik/Downloads/predictionsfordice.txt')

lines = f.readlines()
categories = set()
test_predictions = {}
for line in lines:
    line = line.strip().split('\t')
    test_predictions[line[0]] = set(line[1:])
    categories = categories.union(set(line[1:]))

f = open('data/cleaned_testquestions.csv')
reader = csv.reader(f, delimiter=",",quotechar='"')
test_expectations = {}
for line in reader:
    test_expectations[line[0]] = set(line[1].split(' '))
    categories.union(set(line[1].split(' ')))

#calculate dice 
dice = []
for k,v in test_predictions.items():
    w = test_expectations[k]
    i = len(v.intersection(w))
    dice.append(2.0*i/(len(v)+len(w)))
#print sum(dice)/len(dice)

print categories
#calculate the results per category
for cat in categories:
    dice = []                                                                          
    for k,v in test_predictions.items():
        w = test_expectations[k]
        if cat in w:
            i = len(v.intersection(w))
            dice.append(2.0*i/(len(v)+len(w)))
    print cat
    print sum(dice)/len(dice)
