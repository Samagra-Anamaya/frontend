const tb = `Bagata, Bhakta
Baiga
Banjara,Banjari
Bathudi, Bathuri
Bhottada, Dhotada, Bhotra, Bhatra, Bhattara, Bhotora, Bhatara
Bhuiya, Bhuyan
Bhumia
Bhumij, Teli Bhumij, Haladipokhria Bhumij, Haladi Pokharia Bhumija, Desi Bhumij, Desia Bhumij, Tamaria Bhumij
Bhunjia
Binjhal, Binjhwar
Binjhia, Binjhoa
Birhor
Bondo Poraja, Bonda Paroja, Banda Paroja
Chenchu
Dal
Desua Bhumij
Dharua, Dhuruba, Dhurva
Didayi, Didai Paroja, Didai
Gadaba, Bodo Gadaba, Gutob Gadaba, Kapu Gadaba, Ollara Gadaba, Parenga Gadaba, Sano Gadaba
Gandia
Ghara
Gond, Gondo, Rajgond, Maria Gond, Dhur Gond
Ho
Holva
Jatapu
Juang
Kandha Gauda
Kawar, Kanwar
Kharia, Kharian, Berga Kharia, Dhelki Kharia, Dudh Kharia, Erenga Kharia, Munda Kharia, Oraon Kharia, Khadia, Pahari Kharia
Kharwar
Khond, Kond, Kandha, Nanguli Kandha, Sitha Kandha, Kondh, Kui, Buda Kondh, Bura Kandha, Desia Kandha, Dungaria Kondh, Kutia Kandha, Kandha Gauda, Muli Kondh, Malua Kondh, Pengo Kandha, Raja Kondh, Raj Khond
Kisan, Nagesar, Nagesia
Kol
Kolah Loharas, Kol Loharas
Kolha
Koli, Malhar
Kondadora
Kora, Khaira, Khayara
Korua
Kotia
Koya, Gumba Koya, Koitur Koya, Kamar Koya, Musara Koya
Kulis
Lodha, Nodh, Nodha, Lodh
Madia
Mahali
Mankidi
Mankirdia, Mankria, Mankidi
Matya, Matia
Mirdhas, Kuda, Koda
Munda, Munda Lohara, Munda Mahalis, Nagabanshi Munda, Oriya Munda
Mundari
Omanatya, Omanatyo, Amanatya
Oraon, Dhangar, Uran
Parenga
Paroja, Parja, Bodo Paroja, Barong Jhodia Paroja, Chhelia Paroja, Jhodia Paroja, Konda Paroja, Paraja, Ponga Paroja, Sodia Paroja, Sano Paroja, Solia Paroja
Pentia
Rajuar
Santal
Saora, Savar, Saura, Sahara, Arsi Saora, Based Saora, Bhima Saora, Bhimma Saora, Chumura Saora, Jara Savar, Jadu Saora, Jati Saora, Juari Saora, Kampu Saora, Kampa Soura, Kapo Saora, Kindal Saora, Kumbi Kancher Saora, Kalapithia Saora, Kirat Saora, Lanjia Saora, Lamba Lanjia Saora, Luara Saora, Luar Saora, Laria Savar, Malia Saora, Malla Saora, Uriya Saora, Raika Saora, Sudda Saora, Sarda Saora, Tankala Saora, Patro Saora, Vesu Saora
Shabar, Lodha
Sounti
Tharua, Tharua Bindhani,
Birhor
Bondo
Didayi
Dongria-Khond
Juangs
Kharias
Kutia Kondh
Lanjia Sauras
Lodhas
Mankidias
Paudi Bhuyans
Soura
Chuktia Bhunjia
`;

export const getTbName = () => {
  const dataArray = tb.split(/\n/).flatMap((line) => {
    return line.split(",").map((label) => ({
      label: label.trim(),
    }));
  });

  // Filter out any empty strings that might be a result of blank lines
  return dataArray.filter((item) => item.label);
};
