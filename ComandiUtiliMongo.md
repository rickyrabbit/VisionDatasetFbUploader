#Comandi utili Mongo

####Tutte le tipologie di video
```
['nat','natWA','flat','flatWA','flatYT','indoor','indoorWA','indoorYT','outdoor','outdoorWA','outdoorYT']
```
***
### *Compass*
####Trova le tipologie di video che appartengono a flat,outdoor e indoor




> Nella casella **Filter**
```
{mediatipology:{$in:["flat","indoor","outdoor"]}}

```
***

### *Shell*
#### Vedere tutta la collection 

```
db.prova.find().pretty()
```

#### Update e Set 

```
db.prova.updateMany({fbsrcexists:"false"},{$set:{uploaded:"false",fbsource:""}},{upsert:false});
```

#### Contare elementi nella collection 

```
db.prova.find().count()
```
***


### *Shell*
####Update di campi 
>**Match** 
> *uploaded* :true
> *fbsource*  è lungo meno di 17

> **Set**
> *set:{...}* ha indicato tutte le field nuove  

> **Altro**
> *upsert* :false perchè non inserisce il nuovo documento se non c'è match
> *multi*  :true perchè è upgrade multiplo
```
db.prova.update({"uploaded":"true","$expr": { "$lt": [ { "$strLenCP": "$fbsource" }, 17 ]}},{$set:{fbsource:"",uploaded:"false"}},{upsert:false,multi:true})
```
***

### *Shell*
####Inserimento di nuove field nei documenti
>**Match** 
> *media* :videos

> **Set**
> *set:{...}* ha indicato tutte le field nuove  

> **Altro**
> *upsert* :false perchè non inserisce il nuovo documento se non c'è match
> *multi*  :true perchè è upgrade multiplo
```
db.prova.update({media:"videos"},{$set:{fbvideores:"",fbvideourl:"",use:""}},{upsert:false,multi:true})
```

***