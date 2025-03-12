package com.scharfenort.adsbackend.repository;

import com.scharfenort.adsbackend.model.AdFurniture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdFurnitureRepository extends JpaRepository<AdFurniture, Long> {
}
