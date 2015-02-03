the team
========


Requires grunt, couchdb and kanso



Initial Setup:
----------------
    php convert_data.json.php -> reads jsonfiler/data_00.json and uploads data to couchdb



 Internal Config:
 ----------------
    http://couchdbserver:5984/theteam/_design/b2/_rewrite/start
    Login with couchdb account


 Nginx Public Config:
 --------------------

    #------------------------------------------------------------------------------#
    ##################################  the team  ##################################
    #------------------------------------------------------------------------------#

    location /theteam/_design/ {

        if ($request_method !~ ^(GET|HEAD|POST)$ ) {
            return 405;
        }

        gzip off;
        
        include /etc/nginx/expires_header;
        include /etc/nginx/id_header;

        include /etc/nginx/proxy_params;
        proxy_pass http://localhost:5984/theteam/_design/;
    }

    location /theteam/start {
        return 301 http://www.zdf.de/;
    }

    location /theteam/_design/b2/_rewrite/start {
        return 301 http://www.zdf.de/;
    }

    location /theteam/_design/b2/_show/detail_view_edit {
        return 301 http://www.zdf.de/;
    }

    location /theteam/ {
        if ($request_method !~ ^(GET|HEAD|POST)$ ) {
            return 405;
        }

        gzip off;

        include /etc/nginx/expires_header;
        include /etc/nginx/id_header;

        include /etc/nginx/proxy_params;
        proxy_pass http://localhost:5984/theteam/_design/b2/_rewrite/;
    }